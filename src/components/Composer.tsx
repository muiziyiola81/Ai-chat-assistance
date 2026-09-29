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
  BrainCircuit,
  X,
  FileText,
  Table,
  SlidersHorizontal,
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
      setTimeout(() => setRecognitionError(null), 3500);
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
          setRecognitionError(`Voice input error: ${event.error}`);
        }
        setIsRecording(false);
        setTimeout(() => setRecognitionError(null), 3500);
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
        reader.onload = () => {
          const content = reader.result as string;
          onAddAttachment({
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            type: 'file',
            mimeType: file.type || 'text/plain',
            size: file.size,
            base64: btoa(unescape(encodeURIComponent(content))),
            textContent: content.slice(0, 50000),
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
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3 sm:pb-5">
      {/* Speech error notification */}
      <AnimatePresence>
        {recognitionError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="mb-2 px-3 py-1.5 rounded-xl bg-[#171717] border border-[#333333] text-xs text-[#E5E5E5] flex items-center justify-between"
          >
            <span>{recognitionError}</span>
            <button
              onClick={() => setRecognitionError(null)}
              className="text-[#A3A3A3] hover:text-[#FFFFFF]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Composer Box - Light-Black Morph Container */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className={`relative rounded-2xl bg-[#0A0A0A] border transition-all duration-200 ${
          isGenerating
            ? 'border-[#404040]'
            : 'border-[#222222] hover:border-[#333333] focus-within:border-[#444444]'
        }`}
      >
        {/* Attachment Previews */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-3.5 pt-3 flex flex-wrap gap-2 items-center overflow-hidden border-b border-[#1A1A1A] pb-2.5"
            >
              {attachments.map((att) => (
                <motion.div
                  key={att.id}
                  layout
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="group relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#3A3A3A] transition-all max-w-[200px]"
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
                        className="w-7 h-7 rounded-lg object-cover border border-[#2A2A2A] flex-shrink-0"
                      />
                      <div className="truncate text-xs text-[#E5E5E5]">
                        <div className="truncate font-medium">{att.name}</div>
                        <div className="text-[10px] text-[#737373]">Image</div>
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-7 h-7 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0 text-[#A3A3A3]">
                        {att.name.endsWith('.csv') || att.name.endsWith('.xlsx') ? (
                          <Table className="w-3.5 h-3.5" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="truncate text-xs text-[#E5E5E5]">
                        <div className="truncate font-medium">{att.name}</div>
                        <div className="text-[10px] text-[#737373]">
                          {Math.round(att.size / 1024)} KB
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(att.id)}
                    className="p-1 rounded-full bg-[#1C1C1C] hover:bg-[#2A2A2A] text-[#A3A3A3] hover:text-[#FFFFFF] transition-colors"
                    title="Remove attachment"
                    aria-label="Remove attachment"
                  >
                    <X className="w-3 h-3" />
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
                ? 'Ask GPT Hub with deep reasoning...'
                : webSearch
                ? 'Search the web or ask anything...'
                : 'Message GPT Hub...'
            }
            rows={1}
            className="w-full bg-transparent text-[15px] text-[#FFFFFF] placeholder-[#666666] resize-none outline-none focus:outline-none min-h-[36px] max-h-[200px] leading-relaxed selection:bg-white/20"
          />
        </div>

        {/* Composer Controls & Toolbars */}
        <div className="px-3 pb-2.5 pt-1 flex items-center justify-between gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
          {/* Left Actions: Attach, Camera, Voice, Tools, Search, Think */}
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
              className="p-2 rounded-xl bg-transparent hover:bg-[#171717] text-[#A3A3A3] hover:text-[#FFFFFF] transition-all active:scale-95"
              title="Attach files or images"
              aria-label="Attach files or images"
            >
              <Paperclip className="w-4 h-4 sm:w-[17px] sm:h-[17px]" />
            </button>

            {/* Camera Button */}
            <button
              type="button"
              onClick={onOpenCamera}
              className="p-2 rounded-xl bg-transparent hover:bg-[#171717] text-[#A3A3A3] hover:text-[#FFFFFF] transition-all active:scale-95"
              title="Take photo"
              aria-label="Take photo"
            >
              <Camera className="w-4 h-4 sm:w-[17px] sm:h-[17px]" />
            </button>

            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2 rounded-xl transition-all active:scale-95 ${
                isRecording
                  ? 'bg-[#222222] text-[#FFFFFF] border border-[#404040]'
                  : 'bg-transparent hover:bg-[#171717] text-[#A3A3A3] hover:text-[#FFFFFF]'
              }`}
              title={isRecording ? 'Stop voice recording' : 'Voice input'}
              aria-label={isRecording ? 'Stop voice recording' : 'Voice input'}
            >
              {isRecording ? (
                <div className="flex items-center gap-1.5">
                  <MicOff className="w-4 h-4 text-[#FFFFFF] animate-pulse" />
                  <span className="hidden sm:inline text-[11px] font-medium text-[#FFFFFF]">
                    Listening...
                  </span>
                </div>
              ) : (
                <Mic className="w-4 h-4 sm:w-[17px] sm:h-[17px]" />
              )}
            </button>

            {/* Tools Menu Trigger */}
            <button
              type="button"
              onClick={onOpenTools}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-[#111111] hover:bg-[#1C1C1C] text-[#A3A3A3] hover:text-[#FFFFFF] transition-all border border-[#222222] active:scale-95"
              title="Open Tools"
              aria-label="Open Tools"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tools</span>
            </button>

            <div className="hidden sm:block w-[1px] h-4 bg-[#222222] mx-0.5" />

            {/* Web Search Toggle Pill */}
            <button
              type="button"
              onClick={() => setWebSearch((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 border ${
                webSearch
                  ? 'bg-[#222222] text-[#FFFFFF] border-[#444444]'
                  : 'bg-[#111111] text-[#A3A3A3] border-[#222222] hover:bg-[#171717] hover:text-[#FFFFFF]'
              }`}
              title="Search the web for current information"
              aria-label="Toggle web search"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Search</span>
            </button>

            {/* Think Mode Toggle Pill */}
            <button
              type="button"
              onClick={() => setThinkMode((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 border ${
                thinkMode
                  ? 'bg-[#222222] text-[#FFFFFF] border-[#444444]'
                  : 'bg-[#111111] text-[#A3A3A3] border-[#222222] hover:bg-[#171717] hover:text-[#FFFFFF]'
              }`}
              title="Think Mode: Deep reasoning"
              aria-label="Toggle Think Mode"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>{thinkMode ? 'Think' : 'Instant'}</span>
            </button>
          </div>

          {/* Right Action: Send / Stop Generating Button */}
          <div className="flex items-center gap-2 ml-auto">
            {isGenerating ? (
              <motion.button
                type="button"
                onClick={onStop}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#000000] flex items-center justify-center transition-all cursor-pointer"
                title="Stop generation"
                aria-label="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-[#000000]" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={onSend}
                disabled={!canSend}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={canSend ? { scale: 1.04 } : {}}
                whileTap={canSend ? { scale: 0.96 } : {}}
                transition={{ duration: 0.15 }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                  canSend
                    ? 'bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#000000] cursor-pointer'
                    : 'bg-[#171717] text-[#404040] border border-[#222222] cursor-not-allowed'
                }`}
                title="Send message (Enter)"
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
