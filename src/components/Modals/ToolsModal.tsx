import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Globe,
  BrainCircuit,
  Image,
  FileSpreadsheet,
  Mic,
  SlidersHorizontal,
} from 'lucide-react';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  webSearch: boolean;
  setWebSearch: (value: boolean | ((prev: boolean) => boolean)) => void;
  thinkMode: boolean;
  setThinkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export const ToolsModal: React.FC<ToolsModalProps> = ({
  isOpen,
  onClose,
  webSearch,
  setWebSearch,
  thinkMode,
  setThinkMode,
}) => {
  if (!isOpen) return null;

  const tools = [
    {
      id: 'webSearch',
      name: 'Web Grounding',
      description: 'Search the live web with verified source links and citations.',
      icon: Globe,
      isActive: webSearch,
      toggle: () => setWebSearch((prev) => !prev),
      badge: 'Toggleable',
    },
    {
      id: 'thinkMode',
      name: 'Deep Reasoning',
      description: 'Extended multi-step logic and deliberate problem solving for complex coding, math, and STEM inquiries.',
      icon: BrainCircuit,
      isActive: thinkMode,
      toggle: () => setThinkMode((prev) => !prev),
      badge: 'Toggleable',
    },
    {
      id: 'imageAnalysis',
      name: 'Multimodal Vision',
      description: 'Analyze screenshots, diagrams, and photos uploaded from your device or captured with the camera.',
      icon: Image,
      isActive: true,
      badge: 'Active',
    },
    {
      id: 'dataAnalysis',
      name: 'File & Data Engine',
      description: 'Inspect CSV, XLSX spreadsheets, PDFs, and code documents with structured extraction.',
      icon: FileSpreadsheet,
      isActive: true,
      badge: 'Active',
    },
    {
      id: 'voice',
      name: 'Spoken Voice & Audio',
      description: 'Hands-free speech-to-text input and natural text-to-speech voice synthesis.',
      icon: Mic,
      isActive: true,
      badge: 'Active',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative z-10 w-full max-w-lg bg-[#0A0A0A] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1A1A1A] bg-[#0E0E0E]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#FFFFFF]" />
              <h2 className="text-sm font-semibold text-[#FFFFFF]">
                Tools & Capabilities
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#737373] hover:text-[#FFFFFF] hover:bg-[#171717] transition-colors"
              aria-label="Close tools menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tools List */}
          <div className="p-4 space-y-2.5 overflow-y-auto max-h-[70vh]">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    tool.isActive
                      ? 'bg-[#111111] border-[#333333]'
                      : 'bg-[#0E0E0E] border-[#1F1F1F]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-[#171717] border border-[#262626] text-[#FFFFFF] mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#FFFFFF]">
                            {tool.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#171717] border border-[#262626] text-[#737373]">
                            {tool.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#A3A3A3] mt-1 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    {tool.toggle && (
                      <button
                        onClick={tool.toggle}
                        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-1 cursor-pointer border ${
                          tool.isActive
                            ? 'bg-[#FFFFFF] border-[#FFFFFF]'
                            : 'bg-[#171717] border-[#333333]'
                        }`}
                        aria-label={`Toggle ${tool.name}`}
                      >
                        <motion.div
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className={`w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                            tool.isActive
                              ? 'translate-x-5 bg-[#000000]'
                              : 'translate-x-0.5 bg-[#737373]'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-[#0E0E0E] border-t border-[#1A1A1A] text-[11px] text-[#737373] flex items-center justify-between">
            <span>Tools apply automatically to new prompts.</span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#000000] font-medium text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
