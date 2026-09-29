import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
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
  AlertCircle,
  FileText,
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
    setTimeout(() => setCopiedId(null), 1800);
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
      // Fallback
    }

    fallbackBrowserSpeech(msg.content);
  };

  const fallbackBrowserSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setSpeakingMessageId(null);
      return;
    }

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
      title: 'Analyze Complex Logic',
      desc: 'Use Think Mode deep reasoning to solve a multi-variable problem',
      icon: Cpu,
      prompt: 'Can you solve this logic problem with step-by-step reasoning: Three prisoners are given red and blue hats...',
    },
    {
      title: 'Web Grounding with Citations',
      desc: 'Search current tech breakthroughs and retrieve verified source links',
      icon: Search,
      prompt: 'What are the most notable announcements in AI this week? Please provide direct web sources.',
    },
    {
      title: 'Code Architecture Review',
      desc: 'Refactor and optimize TypeScript state management with clean patterns',
      icon: Code,
      prompt: 'Review and optimize a high-throughput React state management pattern with event-driven streaming.',
    },
    {
      title: 'Technical Proposal Draft',
      desc: 'Draft an executive briefing or implementation blueprint',
      icon: PenTool,
      prompt: 'Draft an executive briefing on implementing autonomous multi-agent systems for enterprise workflows.',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 max-w-3xl w-full mx-auto">
      {/* Empty State */}
      {messages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="min-h-[55vh] flex flex-col items-center justify-center text-center px-4"
        >
          {/* Logo badge - Restrained Monochrome */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#111111] border border-[#262626] flex items-center justify-center mb-5 shadow-sm">
            <span className="font-bold text-xl sm:text-2xl text-[#FFFFFF] tracking-tight">
              GH
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold text-[#FFFFFF] tracking-tight mb-2">
            {assistant && assistant.id !== 'default'
              ? assistant.name
              : 'What would you like to solve?'}
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-md mx-auto mb-8 leading-relaxed">
            {assistant && assistant.id !== 'default'
              ? assistant.description
              : 'GPT Hub provides progressive streaming, deep reasoning Think Mode, and verified search grounding.'}
          </p>

          {/* Starter Prompts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl text-left">
            {starterPrompts.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => onSendSuggestedPrompt(card.prompt)}
                  className="p-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#141414] border border-[#222222] hover:border-[#333333] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-lg bg-[#171717] text-[#FFFFFF] group-hover:bg-[#222222] transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-xs text-[#FFFFFF]">
                      {card.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#737373] leading-relaxed line-clamp-2">
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {/* User Message */}
                {isUser ? (
                  <div className="max-w-[85%] sm:max-w-[75%] space-y-2">
                    {/* User Attached Media */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-end mb-1">
                        {msg.attachments.map((att) => (
                          <div key={att.id} className="relative group">
                            {att.type === 'image' ? (
                              <button
                                onClick={() => onOpenImage(att)}
                                className="block rounded-xl overflow-hidden border border-[#2A2A2A] hover:border-[#404040] transition-all cursor-pointer"
                                title="Click to expand image"
                              >
                                <img
                                  src={att.previewUrl || att.base64}
                                  alt={att.name}
                                  className="w-24 sm:w-32 h-24 sm:h-32 object-cover"
                                />
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141414] border border-[#262626] text-xs text-[#E5E5E5]">
                                <FileText className="w-3.5 h-3.5 text-[#A3A3A3]" />
                                <span className="truncate max-w-[130px]">
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
                      <div className="p-3 rounded-2xl bg-[#111111] border border-[#404040] w-full sm:w-[440px] shadow-lg">
                        <textarea
                          rows={3}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-transparent text-sm text-[#FFFFFF] outline-none resize-none leading-relaxed"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="px-3 py-1 rounded-lg text-xs text-[#A3A3A3] hover:text-[#FFFFFF]"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => submitEdit(index)}
                            className="px-3.5 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#000000] font-medium text-xs"
                          >
                            Resubmit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="group relative">
                        <div className="px-4 py-2.5 rounded-2xl sm:rounded-3xl bg-[#171717] border border-[#262626] text-[#FFFFFF] text-[14.5px] leading-relaxed">
                          {msg.content}
                        </div>

                        {/* Edit Button */}
                        {!isGenerating && (
                          <button
                            onClick={() => startEdit(index, msg.content)}
                            className="absolute -left-7 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#737373] hover:text-[#FFFFFF] hover:bg-[#141414] opacity-0 group-hover:opacity-100 transition-all"
                            title="Edit message"
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
                  <div className="w-full space-y-2.5">
                    {/* Header: Avatar, Name & Think/Search status */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center text-[#FFFFFF] font-bold text-xs">
                        GH
                      </div>
                      <span className="font-medium text-xs text-[#FFFFFF]">
                        {assistant ? assistant.name : 'GPT Hub'}
                      </span>

                      {/* Think Mode Badge if reasoning was used */}
                      {msg.thinkModeUsed && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-[#141414] border border-[#262626] text-[10px] text-[#A3A3A3]">
                          <BrainCircuit className="w-3 h-3 text-[#A3A3A3]" />
                          <span>Reasoned</span>
                        </div>
                      )}
                    </div>

                    {/* Thinking status indicator during generation */}
                    {msg.isThinking && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0A0A0A] border border-[#222222] text-xs text-[#A3A3A3]">
                        <div className="w-3 h-3 border-2 border-[#FFFFFF] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        <span>
                          {msg.thinkingText || 'Thinking...'}
                        </span>
                      </div>
                    )}

                    {/* Web Search Sources Panel */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="my-2 p-3 rounded-xl bg-[#0A0A0A] border border-[#222222]">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-[#FFFFFF] mb-2">
                          <Globe className="w-3.5 h-3.5 text-[#A3A3A3]" />
                          <span>Sources ({msg.sources.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
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
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] text-[11px] text-[#D4D4D4] transition-colors group max-w-[220px]"
                                title={src.title}
                              >
                                <span className="font-mono text-[#737373] text-[10px]">
                                  {sIdx + 1}
                                </span>
                                <span className="truncate">{src.title || domain}</span>
                                <ExternalLink className="w-3 h-3 text-[#737373] group-hover:text-[#FFFFFF] flex-shrink-0" />
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
                      <div className="p-3 rounded-xl bg-[#141414] border border-[#333333] text-xs text-[#E5E5E5] space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-[#A3A3A3]" />
                          <span className="font-medium text-[#FFFFFF]">Notice</span>
                        </div>
                        <p className="text-[#A3A3A3]">{msg.error}</p>
                        <button
                          onClick={onRegenerate}
                          className="px-3 py-1 rounded-lg bg-[#1F1F1F] hover:bg-[#262626] border border-[#333333] text-xs text-[#FFFFFF]"
                        >
                          Retry Request
                        </button>
                      </div>
                    ) : null}

                    {/* Action Bar (Copy, Speak, Regenerate, Share) */}
                    {msg.content && !isGenerating && (
                      <div className="flex items-center gap-1 pt-1 text-[#737373]">
                        {/* Copy Response */}
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="p-1.5 rounded-lg hover:text-[#FFFFFF] hover:bg-[#141414] transition-colors"
                          title="Copy response"
                          aria-label="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-[#FFFFFF]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Spoken Audio TTS */}
                        <button
                          onClick={() => handleToggleSpeak(msg)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            speakingMessageId === msg.id
                              ? 'text-[#FFFFFF] bg-[#222222]'
                              : 'hover:text-[#FFFFFF] hover:bg-[#141414]'
                          }`}
                          title={
                            speakingMessageId === msg.id
                              ? 'Stop voice'
                              : 'Read aloud'
                          }
                          aria-label={
                            speakingMessageId === msg.id
                              ? 'Stop voice'
                              : 'Read aloud'
                          }
                        >
                          {speakingMessageId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Regenerate Response */}
                        {index === messages.length - 1 && (
                          <button
                            onClick={onRegenerate}
                            className="p-1.5 rounded-lg hover:text-[#FFFFFF] hover:bg-[#141414] transition-colors"
                            title="Regenerate"
                            aria-label="Regenerate"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Share */}
                        <button
                          onClick={onOpenShare}
                          className="p-1.5 rounded-lg hover:text-[#FFFFFF] hover:bg-[#141414] transition-colors"
                          title="Share"
                          aria-label="Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
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
