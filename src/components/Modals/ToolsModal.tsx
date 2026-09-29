import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Globe,
  BrainCircuit,
  Image,
  FileSpreadsheet,
  Mic,
  CheckCircle2,
  Sliders,
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
      name: 'Live Web Grounding',
      description: 'Searches real-time web sources via Google Search grounding and returns verified citations with direct URLs.',
      icon: Globe,
      isActive: webSearch,
      toggle: () => setWebSearch((prev) => !prev),
      badge: 'Interactive',
    },
    {
      id: 'thinkMode',
      name: 'Deep Reasoning (Think Mode)',
      description: 'Activates comprehensive analytical logic and deliberate multi-step problem solving for complex coding, math, and STEM inquiries.',
      icon: BrainCircuit,
      isActive: thinkMode,
      toggle: () => setThinkMode((prev) => !prev),
      badge: 'Interactive',
    },
    {
      id: 'imageAnalysis',
      name: 'Multimodal Vision Analysis',
      description: 'Understands photos, screenshots, diagrams, and artwork uploaded from device or captured via live camera.',
      icon: Image,
      isActive: true,
      badge: 'Always Active',
    },
    {
      id: 'dataAnalysis',
      name: 'Spreadsheet & File Engine',
      description: 'Parses CSV, XLSX, PDF, TXT, and code files to generate structured summaries, metrics, and insights.',
      icon: FileSpreadsheet,
      isActive: true,
      badge: 'Always Active',
    },
    {
      id: 'voice',
      name: 'Spoken Voice & Speech-to-Text',
      description: 'Listen to spoken AI responses using high-fidelity TTS voices and dictate messages hands-free via microphone.',
      icon: Mic,
      isActive: true,
      badge: 'Always Active',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative z-10 w-full max-w-lg bg-[#09110d] border border-emerald-800/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-900/40 bg-[#0c1611]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-emerald-100">
                GPT Hub Tools & Capabilities
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-950/60 transition-colors"
              aria-label="Close tools menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tools List */}
          <div className="p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[70vh]">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    tool.isActive
                      ? 'bg-emerald-950/30 border-emerald-700/50 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                      : 'bg-[#0b140f] border-emerald-950/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-xl border mt-0.5 ${
                          tool.isActive
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-emerald-950/30 border-emerald-900/40 text-emerald-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-emerald-100">
                            {tool.name}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              tool.isActive
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-emerald-950/50 text-emerald-500/60'
                            }`}
                          >
                            {tool.badge}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-400/70 mt-1 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    {tool.toggle && (
                      <button
                        onClick={tool.toggle}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-1 cursor-pointer ${
                          tool.isActive ? 'bg-emerald-500' : 'bg-emerald-950/80 border border-emerald-800/40'
                        }`}
                        aria-label={`Toggle ${tool.name}`}
                      >
                        <motion.div
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                            tool.isActive ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="px-5 py-3 bg-[#0a130e] border-t border-emerald-900/40 text-[11px] text-emerald-400/60 flex items-center justify-between">
            <span>Changes apply immediately to upcoming messages.</span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
