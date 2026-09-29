import { GroundingSource, Message } from '../types';

export interface StreamChatParams {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    attachments?: any[];
  }>;
  model: string;
  thinkMode: boolean;
  webSearch: boolean;
  systemInstruction?: string;
  responseStyle?: string;
  assistantName?: string;
  projectInstructions?: string;
  signal?: AbortSignal;
  onChunk: (textChunk: string) => void;
  onStatus?: (status: string) => void;
  onGrounding?: (sources: GroundingSource[]) => void;
  onError?: (error: string) => void;
  onDone?: () => void;
}

export const ApiService = {
  async streamChat({
    messages,
    model,
    thinkMode,
    webSearch,
    systemInstruction,
    responseStyle,
    assistantName,
    projectInstructions,
    signal,
    onChunk,
    onStatus,
    onGrounding,
    onError,
    onDone,
  }: StreamChatParams): Promise<void> {
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model,
          thinkMode,
          webSearch,
          systemInstruction,
          responseStyle,
          assistantName,
          projectInstructions,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported in response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.slice(5).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'text' && data.text) {
                onChunk(data.text);
              } else if (data.type === 'status' && data.status) {
                onStatus?.(data.status);
              } else if (data.type === 'grounding' && data.sources) {
                onGrounding?.(data.sources);
              } else if (data.type === 'error') {
                onError?.(data.error || 'Server error occurred');
              } else if (data.type === 'done') {
                onDone?.();
              }
            } catch (err) {
              console.warn('Could not parse SSE chunk JSON:', dataStr, err);
            }
          }
        }
      }

      onDone?.();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Generation was stopped by user
        onDone?.();
      } else {
        onError?.(err?.message || 'Failed to communicate with AI server');
      }
    }
  },

  async requestTTS(text: string, voiceName: string = 'Kore'): Promise<string | null> {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) return data.audioUrl;
      }
    } catch (e) {
      console.warn('Backend TTS request error:', e);
    }
    return null;
  },
};
