import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUp,
  Square,
  Paperclip,
  Camera,
  Mic,
  MicOff,
  Globe,
  Sparkles,
  BrainCircuit,
  X,
  FileText,
  Table,
  Image as ImageIcon,
  ChevronUp,
} from 'lucide-react';
import { Attachment } from '../types';

interface ComposerProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isGenerating: boolean;
  thinkMode: boolean;
  setThinkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  webSearch: boolean;
  setWebSearch: (value: boolean | ((prev: boolean) => boolean)) => void;
  attachments: Attachment[];
  onAddAttachment: (attachment: Attachment) => void;
  onRemoveAttachment: (id: string) => void;
  onOpenImage: (attachment: Attachment) => void;
  onOpenCamera: () => void;
  onOpenTools: () => void;
  disabled?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isGenerating,
  thinkMode,
  setThinkMode,
  webSearch,
  setWebSearch,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  onOpenImage,
  onOpenCamera,
  onOpenTools,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [input]);

  // Handle Speech Recognition
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionError(
        'Speech recognition is not supported in this browser. Please use Chrome or Safari.'
      );
      setTimeout(() => setRecognitionError(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setRecognitionError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput(input ? `${input.trim()} ${transcript}` : transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setRecognitionError('Microphone permission was denied.');
        } else {
          setRecognitionError(`Voice error: ${event.error}`);
        }
        setIsRecording(false);
        setTimeout(() => setRecognitionError(null), 4000);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setRecognitionError('Could not start microphone.');
      setIsRecording(false);
    }
  };

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImg = file.type.startsWith('image/');
      const reader = new FileReader();

      if (isImg) {
        reader.onload = () => {
          const base64 = reader.result as string;
          onAddAttachment({
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            type: 'image',
            mimeType: file.type || 'image/jpeg',
            size: file.size,
            base64,
            previewUrl: base64,
          });
        };
        reader.readAsDataURL(file);
      } else {
        // Read text or file data
        reader.onload = () => {
          const content = reader.result as string;
          onAddAttachment({
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            type: 'file',
            mimeType: file.type || 'text/plain',
            size: file.size,
            base64: btoa(unescape(encodeURIComponent(content))),
            textContent: content.slice(0, 50000), // Preview limit for prompt injection
          });
        };
        reader.readAsText(file);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((input.trim() || attachments.length > 0) && !isGenerating && !disabled) {
        onSend();
      }
    }
  };

  const canSend = (input.trim().length > 0 || attachments.length > 0) && !disabled;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-3 sm:pb-5">
      {/* Speech error notification */}
      <AnimatePresence>
        {recognitionError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-2.5 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500/30 text-xs text-red-200 flex items-center justify-between"
          >
            <span>{recognitionError}</span>
            <button
              onClick={() => setRecognitionError(null)}
              className="text-red-300 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Composer Box */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className={`relative rounded-2xl bg-[#0a120d]/90 backdrop-blur-xl border transition-all duration-300 ${
          isGenerating
            ? 'border-emerald-600/40 shadow-[0_0_25px_rgba(16,185,129,0.12)]'
            : 'border-emerald-900/40 hover:border-emerald-700/50 shadow-xl'
        }`}
      >
        {/* Attachment Previews */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3.5 pt-3.5 flex flex-wrap gap-2.5 items-center overflow-hidden border-b border-emerald-950/40 pb-2.5"
            >
              {attachments.map((att) => (
                <motion.div
                  key={att.id}
                  layoutId={`att-${att.id}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="group relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-800/40 hover:border-emerald-600/50 transition-all max-w-[220px]"
                >
                  {att.type === 'image' ? (
                    <button
                      type="button"
                      onClick={() => onOpenImage(att)}
                      className="flex items-center gap-2 text-left w-full overflow-hidden"
                      title="Click to view full image"
                    >
                      <img
                        src={att.previewUrl || att.base64}
                        alt={att.name}
                        className="w-8 h-8 rounded-lg object-cover border border-emerald-700/30 flex-shrink-0"
                      />
                      <div className="truncate text-xs text-emerald-200">
                        <div className="truncate font-medium">{att.name}</div>
                        <div className="text-[10px] text-emerald-400/70">
                          Image
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-emerald-900/40 border border-emerald-700/30 flex items-center justify-center flex-shrink-0 text-emerald-300">
                        {att.name.endsWith('.csv') || att.name.endsWith('.xlsx') ? (
                          <Table className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <FileText className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="truncate text-xs text-emerald-200">
                        <div className="truncate font-medium">{att.name}</div>
                        <div className="text-[10px] text-emerald-400/70">
                          {Math.round(att.size / 1024)} KB
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(att.id)}
                    className="p-1 rounded-full bg-emerald-950 hover:bg-emerald-800/80 text-emerald-400 hover:text-white transition-colors"
                    title="Remove attachment"
                    aria-label="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Input Area */}
        <div className="px-3.5 pt-3 pb-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              thinkMode
                ? 'Ask GPT Hub a deep reasoning question...'
                : webSearch
                ? 'Search the web or ask anything with live sources...'
                : 'Message GPT Hub...'
            }
            rows={1}
            className="w-full bg-transparent text-[15px] sm:text-[15.5px] text-[#e6ece7] placeholder-[#6b7e73] resize-none outline-none focus:outline-none min-h-[36px] max-h-[220px] leading-relaxed selection:bg-emerald-500/30"
          />
        </div>

        {/* Composer Controls & Toolbars */}
        <div className="px-3 pb-2.5 pt-1 flex items-center justify-between gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
          {/* Left Actions: Attach, Camera, Voice, Web, Think */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.doc,.docx,.csv,.xlsx,.json,.md,.ts,.js,.py"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Attach File Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-950/60 transition-all active:scale-95"
              title="Attach images or documents"
              aria-label="Attach images or documents"
            >
              <Paperclip className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* Camera Button */}
            <button
              type="button"
              onClick={onOpenCamera}
              className="p-2 rounded-xl text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-950/60 transition-all active:scale-95"
              title="Take photo with camera"
              aria-label="Take photo with camera"
            >
              <Camera className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2 rounded-xl transition-all active:scale-95 relative ${
                isRecording
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                  : 'text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-950/60'
              }`}
              title={isRecording ? 'Stop voice recording' : 'Voice input'}
              aria-label={isRecording ? 'Stop voice recording' : 'Voice input'}
            >
              {isRecording ? (
                <div className="flex items-center gap-1">
                  <MicOff className="w-4 h-4 animate-pulse text-red-400" />
                  <span className="hidden sm:inline text-[11px] font-medium text-red-300">
                    Listening...
                  </span>
                </div>
              ) : (
                <Mic className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              )}
            </button>

            {/* Tools Menu Trigger */}
            <button
              type="button"
              onClick={onOpenTools}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-emerald-400/90 hover:text-emerald-100 hover:bg-emerald-950/60 transition-all border border-emerald-900/30"
              title="Open GPT Hub Tools"
              aria-label="Open GPT Hub Tools"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Tools</span>
            </button>

            {/* Divider */}
            <div className="hidden sm:block w-[1px] h-5 bg-emerald-900/40 mx-0.5" />

            {/* Web Search Toggle Pill */}
            <button
              type="button"
              onClick={() => setWebSearch((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 border ${
                webSearch
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'bg-emerald-950/30 text-emerald-400/70 border-emerald-900/30 hover:border-emerald-700/40 hover:text-emerald-200'
              }`}
              title="Search the web for current information"
              aria-label="Toggle web search"
            >
              <Globe className={`w-3.5 h-3.5 ${webSearch ? 'text-emerald-400 animate-spin-slow' : ''}`} />
              <span className="hidden xs:inline">Search</span>
            </button>

            {/* Think Mode Toggle Pill */}
            <button
              type="button"
              onClick={() => setThinkMode((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 border ${
                thinkMode
                  ? 'bg-emerald-600/25 text-emerald-200 border-emerald-400/60 shadow-[0_0_14px_rgba(16,185,129,0.3)]'
                  : 'bg-emerald-950/30 text-emerald-400/70 border-emerald-900/30 hover:border-emerald-700/40 hover:text-emerald-200'
              }`}
              title="Think Mode: Deep reasoning and thorough logic"
              aria-label="Toggle Think Mode"
            >
              <BrainCircuit className={`w-3.5 h-3.5 ${thinkMode ? 'text-emerald-300 animate-pulse' : ''}`} />
              <span>{thinkMode ? 'Think Mode' : 'Instant'}</span>
            </button>
          </div>

          {/* Right Action: Send / Stop Generating Button */}
          <div className="flex items-center gap-2 ml-auto">
            {isGenerating ? (
              <motion.button
                type="button"
                onClick={onStop}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 flex items-center justify-center transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                title="Stop generating response"
                aria-label="Stop generating response"
              >
                <Square className="w-4 h-4 fill-emerald-300" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={onSend}
                disabled={!canSend}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={canSend ? { scale: 1.05 } : {}}
                whileTap={canSend ? { scale: 0.95 } : {}}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
                  canSend
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_16px_rgba(16,185,129,0.4)] cursor-pointer active:scale-95'
                    : 'bg-emerald-950/40 text-emerald-800/60 border border-emerald-900/30 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
