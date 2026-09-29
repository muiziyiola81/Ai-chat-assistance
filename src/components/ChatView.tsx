import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Share2,
  Edit2,
  Globe,
  ExternalLink,
  BrainCircuit,
  AlertTriangle,
  FileText,
  Table,
  Image as ImageIcon,
  CheckCircle2,
  Code,
  Search,
  PenTool,
  Cpu,
} from 'lucide-react';
import { Message, Attachment, GroundingSource, Assistant } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ApiService } from '../services/api';

interface ChatViewProps {
  messages: Message[];
  isGenerating: boolean;
  onSendSuggestedPrompt: (prompt: string) => void;
  onRegenerate: () => void;
  onEditMessage: (messageIndex: number, newContent: string) => void;
  onOpenImage: (attachment: Attachment) => void;
  onOpenShare: () => void;
  speechVoice: string;
  assistant?: Assistant;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isGenerating,
  onSendSuggestedPrompt,
  onRegenerate,
  onEditMessage,
  onOpenImage,
  onOpenShare,
  speechVoice,
  assistant,
}) => {
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll when messages update or stream
  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEdit = (index: number, content: string) => {
    setEditingIndex(index);
    setEditContent(content);
  };

  const submitEdit = (index: number) => {
    if (editContent.trim()) {
      onEditMessage(index, editContent.trim());
      setEditingIndex(null);
    }
  };

  const stopAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  };

  const handleToggleSpeak = async (msg: Message) => {
    if (speakingMessageId === msg.id) {
      stopAudio();
      return;
    }

    stopAudio();
    setSpeakingMessageId(msg.id);

    // Try backend high-fidelity TTS first
    try {
      const audioUrl = await ApiService.requestTTS(msg.content, speechVoice);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioElementRef.current = audio;
        audio.onended = () => setSpeakingMessageId(null);
        audio.onerror = () => fallbackBrowserSpeech(msg.content);
        await audio.play();
        return;
      }
    } catch {
      // Fallback to browser speech synthesis
    }

    fallbackBrowserSpeech(msg.content);
  };

  const fallbackBrowserSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setSpeakingMessageId(null);
      return;
    }

    // Clean markdown before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[*_#`\[\]]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    window.speechSynthesis.speak(utterance);
  };

  // Suggested Prompts for Empty State
  const starterPrompts = [
    {
      title: 'Analyze Complex Problem',
      desc: 'Use Think Mode deep reasoning to break down a multi-variable logic question',
      icon: Cpu,
      prompt: 'Can you solve this logic and game theory problem with step-by-step reasoning: Three prisoners are given red and blue hats...',
    },
    {
      title: 'Live Web Grounding',
      desc: 'Search recent technological breakthroughs and retrieve verified source citations',
      icon: Search,
      prompt: 'What are the most significant AI and robotics announcements this week? Please provide citations and sources.',
    },
    {
      title: 'Code Architecture Review',
      desc: 'Refactor and optimize full-stack TypeScript code with best practices',
      icon: Code,
      prompt: 'Review and optimize a high-throughput React state management pattern with event-driven streaming.',
    },
    {
      title: 'Executive Summary & Writing',
      desc: 'Draft an elegant, persuasive technical proposal or briefing document',
      icon: PenTool,
      prompt: 'Draft an executive briefing on implementing autonomous multi-agent systems for enterprise workflows.',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 max-w-4xl w-full mx-auto">
      {/* Empty State */}
      {messages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
        >
          {/* Logo badge with emerald glow */}
          <div className="relative mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-emerald-500/25 via-[#0c1a12] to-[#070d0a] border border-emerald-500/40 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.25)] emerald-glow">
              <span className="font-extrabold text-2xl sm:text-3xl text-emerald-400 tracking-tight">
                GH
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-black shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            {assistant && assistant.id !== 'default'
              ? assistant.name
              : 'What would you like to solve?'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-300/70 max-w-md mx-auto mb-8 leading-relaxed">
            {assistant && assistant.id !== 'default'
              ? assistant.description
              : 'GPT Hub blends progressive stream synthesis, deep reasoning Think Mode, and real-time Google search grounding.'}
          </p>

          {/* Starter Prompts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
            {starterPrompts.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSendSuggestedPrompt(card.prompt)}
                  className="p-3.5 sm:p-4 rounded-2xl bg-[#09130e]/80 hover:bg-emerald-950/40 border border-emerald-900/40 hover:border-emerald-600/50 transition-all shadow-md group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-xs sm:text-sm text-emerald-100 group-hover:text-emerald-300 transition-colors">
                      {card.title}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-emerald-400/60 leading-relaxed line-clamp-2">
                    {card.desc}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ) : (
        /* Conversation Message Stream */
        <div className="space-y-6 pb-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isEditing = editingIndex === index;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {/* User Message */}
                {isUser ? (
                  <div className="max-w-[85%] sm:max-w-[75%] space-y-2">
                    {/* User Attached Media */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-end mb-1.5">
                        {msg.attachments.map((att) => (
                          <div key={att.id} className="relative group">
                            {att.type === 'image' ? (
                              <button
                                onClick={() => onOpenImage(att)}
                                className="block rounded-xl overflow-hidden border border-emerald-700/40 shadow-md hover:border-emerald-400 transition-all cursor-pointer"
                                title="Click to expand image"
                              >
                                <img
                                  src={att.previewUrl || att.base64}
                                  alt={att.name}
                                  className="w-28 sm:w-36 h-28 sm:h-36 object-cover"
                                />
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-xs text-emerald-200">
                                <FileText className="w-4 h-4 text-emerald-400" />
                                <span className="truncate max-w-[140px]">
                                  {att.name}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* User Text Bubble or Edit Form */}
                    {isEditing ? (
                      <div className="p-3 rounded-2xl bg-[#0e1d15] border border-emerald-500 w-full sm:w-[480px] shadow-lg">
                        <textarea
                          rows={3}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-transparent text-sm text-emerald-100 outline-none resize-none leading-relaxed"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="px-3 py-1 rounded-lg text-xs text-emerald-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => submitEdit(index)}
                            className="px-3.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs"
                          >
                            Resubmit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="group relative">
                        <div className="px-4 py-3 rounded-2xl sm:rounded-3xl bg-[#0f2117] border border-emerald-800/40 text-[#ebf3ed] text-[14.5px] sm:text-[15px] leading-relaxed shadow-md">
                          {msg.content}
                        </div>

                        {/* Edit Button */}
                        {!isGenerating && (
                          <button
                            onClick={() => startEdit(index, msg.content)}
                            className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-emerald-500/60 hover:text-emerald-200 hover:bg-emerald-950/60 opacity-0 group-hover:opacity-100 transition-all"
                            title="Edit message & resubmit"
                            aria-label="Edit message"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Assistant Message */
                  <div className="w-full space-y-3">
                    {/* Header: Avatar, Name & Think/Search status */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500/30 to-[#0c1811] border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-xs shadow-sm">
                        GH
                      </div>
                      <span className="font-semibold text-xs text-emerald-100">
                        {assistant ? assistant.name : 'GPT Hub'}
                      </span>

                      {/* Think Mode Badge if reasoning was used */}
                      {msg.thinkModeUsed && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-600/40 text-[10px] text-emerald-300 font-medium">
                          <BrainCircuit className="w-3 h-3 text-emerald-400" />
                          <span>Deep Reasoning</span>
                        </div>
                      )}
                    </div>

                    {/* Thinking status indicator during generation */}
                    {msg.isThinking && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/30 text-xs text-emerald-300/90"
                      >
                        <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        <span className="animate-pulse">
                          {msg.thinkingText || 'Thinking & verifying analysis...'}
                        </span>
                      </motion.div>
                    )}

                    {/* Web Search Sources Panel */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="my-2 p-3 rounded-2xl bg-[#09140f] border border-emerald-900/50">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-2">
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verified Web Grounding Sources ({msg.sources.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((src, sIdx) => {
                            let domain = src.uri;
                            try {
                              domain = new URL(src.uri).hostname.replace(/^www\./, '');
                            } catch {}

                            return (
                              <a
                                key={sIdx}
                                href={src.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/40 text-[11px] text-emerald-200 transition-colors group max-w-[240px]"
                                title={src.title}
                              >
                                <span className="font-mono text-emerald-400 font-semibold">
                                  [{sIdx + 1}]
                                </span>
                                <span className="truncate">{src.title || domain}</span>
                                <ExternalLink className="w-3 h-3 text-emerald-400/60 group-hover:text-emerald-300 flex-shrink-0" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Assistant Markdown Content */}
                    {msg.content ? (
                      <div className="pl-0.5">
                        <MarkdownRenderer
                          content={msg.content}
                          sources={msg.sources}
                          isStreaming={isGenerating && index === messages.length - 1}
                        />
                      </div>
                    ) : msg.isThinking ? null : msg.error ? (
                      <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="font-semibold">Generation Notice</span>
                        </div>
                        <p>{msg.error}</p>
                        <button
                          onClick={onRegenerate}
                          className="px-3 py-1 rounded-lg bg-red-900/60 hover:bg-red-800/80 border border-red-500/50 text-xs text-white font-medium"
                        >
                          Retry Request
                        </button>
                      </div>
                    ) : null}

                    {/* Action Bar (Copy, Speak, Regenerate, Share) */}
                    {msg.content && !isGenerating && (
                      <div className="flex items-center gap-1 pt-1 text-emerald-400/70">
                        {/* Copy Response */}
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="p-1.5 rounded-lg hover:text-emerald-100 hover:bg-emerald-950/60 transition-colors"
                          title="Copy response"
                          aria-label="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Spoken Audio TTS */}
                        <button
                          onClick={() => handleToggleSpeak(msg)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            speakingMessageId === msg.id
                              ? 'text-emerald-300 bg-emerald-500/20'
                              : 'hover:text-emerald-100 hover:bg-emerald-950/60'
                          }`}
                          title={
                            speakingMessageId === msg.id
                              ? 'Stop voice playback'
                              : 'Read response aloud'
                          }
                          aria-label={
                            speakingMessageId === msg.id
                              ? 'Stop voice playback'
                              : 'Read response aloud'
                          }
                        >
                          {speakingMessageId === msg.id ? (
                            <VolumeX className="w-4 h-4 animate-pulse text-emerald-400" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>

                        {/* Regenerate Response */}
                        {index === messages.length - 1 && (
                          <button
                            onClick={onRegenerate}
                            className="p-1.5 rounded-lg hover:text-emerald-100 hover:bg-emerald-950/60 transition-colors"
                            title="Regenerate response"
                            aria-label="Regenerate response"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        {/* Share */}
                        <button
                          onClick={onOpenShare}
                          className="p-1.5 rounded-lg hover:text-emerald-100 hover:bg-emerald-950/60 transition-colors"
                          title="Share conversation"
                          aria-label="Share conversation"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={scrollAnchorRef} className="h-2" />
    </div>
  );
};
