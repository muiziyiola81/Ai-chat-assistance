import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

const app = express();
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// Chat streaming endpoint (Server-Sent Events)
app.post('/api/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let isAborted = false;
  res.on('close', () => {
    isAborted = true;
  });

  const sendEvent = (event: Record<string, any>) => {
    if (!isAborted && !res.writableEnded) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
      (res as any).flush?.();
    }
  };

  try {
    const {
      messages = [],
      model = 'gemini-3.8-flash',
      thinkMode = false,
      webSearch = false,
      systemInstruction = '',
      responseStyle = 'balanced',
      assistantName = 'GPT Hub',
      projectInstructions = '',
    } = req.body;

    if (!ai) {
      // Re-check env in case it was injected dynamically
      const currentKey = process.env.GEMINI_API_KEY;
      if (currentKey && currentKey !== 'MY_GEMINI_API_KEY') {
        ai = new GoogleGenAI({
          apiKey: currentKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });
      }
    }

    if (!ai) {
      sendEvent({
        type: 'error',
        error:
          'GEMINI_API_KEY is not configured. Please check your environment variables in Settings > Secrets.',
      });
      res.end();
      return;
    }

    // Build system instructions with preferences
    let combinedInstructions = `You are ${assistantName}, a sophisticated, highly intelligent, capable AI assistant in the GPT Hub application.
You give well-structured, insightful, direct, and exceptionally helpful answers.
Always use proper formatting with clear markdown headings, lists, tables, and syntax-highlighted code blocks where applicable.`;

    if (responseStyle === 'concise') {
      combinedInstructions += `\nResponse preference: Be direct, concise, and focused. Omit unnecessary filler.`;
    } else if (responseStyle === 'detailed') {
      combinedInstructions += `\nResponse preference: Provide thorough, in-depth explanations with background context, nuances, and step-by-step reasoning.`;
    }

    if (thinkMode) {
      combinedInstructions += `\nYou are operating in Think Mode (Deep Reasoning). Think methodically and solve problems with rigorous precision.`;
      sendEvent({
        type: 'status',
        status: 'Reasoning through your request...',
      });
    }

    if (projectInstructions) {
      combinedInstructions += `\nActive Workspace/Project Context:\n${projectInstructions}`;
    }

    if (systemInstruction) {
      combinedInstructions += `\nUser Instructions & Custom Preferences:\n${systemInstruction}`;
    }

    // Format messages for @google/genai
    const formattedContents: Array<{
      role: 'user' | 'model';
      parts: Array<{
        text?: string;
        inlineData?: { mimeType: string; data: string };
      }>;
    }> = [];

    for (const msg of messages) {
      const parts: Array<{
        text?: string;
        inlineData?: { mimeType: string; data: string };
      }> = [];

      // Add attachments if any
      if (Array.isArray(msg.attachments) && msg.attachments.length > 0) {
        for (const att of msg.attachments) {
          if (att.base64 && att.mimeType) {
            // Strip data:mimeType;base64, prefix if present
            const cleanBase64 = att.base64.replace(/^data:[^;]+;base64,/, '');
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: cleanBase64,
              },
            });
          }
        }
      }

      if (msg.content) {
        parts.push({ text: msg.content });
      }

      if (parts.length > 0) {
        formattedContents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts,
        });
      }
    }

    if (formattedContents.length === 0) {
      sendEvent({ type: 'error', error: 'No message content provided.' });
      res.end();
      return;
    }

    // Configure model call
    const config: any = {
      systemInstruction: combinedInstructions,
    };

    if (thinkMode) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    if (webSearch) {
      sendEvent({
        type: 'status',
        status: 'Searching the web for current information...',
      });
      config.tools = [{ googleSearch: {} }];
    }

    // Selected model fallback
    const targetModel =
      model === 'gpt-hub-reasoning'
        ? 'gemini-3.8-flash'
        : model === 'gpt-hub-fast'
        ? 'gemini-3.1-flash-lite'
        : 'gemini-3.8-flash';

    let responseStream: any = null;
    const candidateModels = [targetModel, 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

    for (const modelToTry of candidateModels) {
      try {
        responseStream = await ai.models.generateContentStream({
          model: modelToTry,
          contents: formattedContents,
          config,
        });
        break; // Successfully started stream
      } catch (err: any) {
        console.warn(`Model ${modelToTry} attempt failed:`, err.message);
        // If webSearch caused 429 quota or 400 error, retry without tools
        if (config.tools && (err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('400'))) {
          console.warn('Retrying without googleSearch tool due to quota...');
          sendEvent({
            type: 'status',
            status: 'Search quota limit reached; synthesizing best knowledge base response...',
          });
          delete config.tools;
          try {
            responseStream = await ai.models.generateContentStream({
              model: modelToTry,
              contents: formattedContents,
              config,
            });
            break;
          } catch (innerErr: any) {
            console.warn(`Retry without tools failed on ${modelToTry}:`, innerErr.message);
          }
        }

        if (candidateModels.indexOf(modelToTry) === candidateModels.length - 1) {
          throw err;
        }
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    if (!responseStream) {
      throw new Error('Unable to establish stream with AI model.');
    }

    const gatheredSources: Array<{ title: string; uri: string }> = [];

    for await (const chunk of responseStream) {
      if (isAborted) break;

      // Check for grounding metadata
      const candidate = chunk.candidates?.[0];
      const grounding = candidate?.groundingMetadata;
      if (grounding?.groundingChunks) {
        for (const gc of grounding.groundingChunks) {
          if (gc.web?.uri) {
            const uri = gc.web.uri;
            const title = gc.web.title || new URL(uri).hostname;
            if (!gatheredSources.some((s) => s.uri === uri)) {
              gatheredSources.push({ title, uri });
            }
          }
        }
      }

      // Stream text chunk
      const text = chunk.text;
      if (text) {
        sendEvent({
          type: 'text',
          text,
        });
      }
    }

    if (gatheredSources.length > 0) {
      sendEvent({
        type: 'grounding',
        sources: gatheredSources,
      });
    }

    sendEvent({ type: 'done' });
    res.end();
  } catch (error: any) {
    console.error('Error generating content stream:', error);
    sendEvent({
      type: 'error',
      error:
        error?.message ||
        'An error occurred while generating the response. Please try again.',
    });
    res.end();
  }
});

// Text-to-Speech endpoint using Gemini TTS
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    if (!ai) {
      return res.status(500).json({ error: 'Gemini client not initialized' });
    }

    // Call gemini-3.8-flash-lite-tts
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 1000), // Clean limit for smooth speech
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from model' });
    }

    res.json({
      audioUrl: `data:audio/wav;base64,${base64Audio}`,
    });
  } catch (err: any) {
    console.warn('TTS error (falling back to client synthesis):', err.message);
    res.status(500).json({
      error: err.message || 'Speech generation unavailable',
      fallbackToBrowser: true,
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GPT Hub server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
