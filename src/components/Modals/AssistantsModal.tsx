import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Bot,
  Plus,
  Sparkles,
  Code2,
  Search,
  BarChart3,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { Assistant } from '../../types';

interface AssistantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistants: Assistant[];
  activeAssistantId: string;
  onSelectAssistant: (assistant: Assistant) => void;
  onCreateAssistant: (assistant: Assistant) => void;
}

export const AssistantsModal: React.FC<AssistantsModalProps> = ({
  isOpen,
  onClose,
  assistants,
  activeAssistantId,
  onSelectAssistant,
  onCreateAssistant,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [webSearchTool, setWebSearchTool] = useState(true);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemPrompt.trim()) return;

    const newAssistant: Assistant = {
      id: `asst-${Date.now()}`,
      name: name.trim(),
      tagline: tagline.trim() || 'Custom Assistant',
      description: description.trim() || tagline.trim(),
      avatarIcon: 'Bot',
      systemPrompt: systemPrompt.trim(),
      tools: {
        webSearch: webSearchTool,
        imageAnalysis: true,
        fileAnalysis: true,
        dataAnalysis: true,
      },
    };

    onCreateAssistant(newAssistant);
    onSelectAssistant(newAssistant);
    setIsCreating(false);
    setName('');
    setTagline('');
    setDescription('');
    setSystemPrompt('');
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return Code2;
      case 'Search':
        return Search;
      case 'BarChart3':
        return BarChart3;
      default:
        return Sparkles;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative z-10 w-full max-w-2xl bg-[#09110d] border border-emerald-800/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/40 bg-[#0c1611]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-emerald-100">
                  {isCreating ? 'Create Custom Assistant' : 'Explore Assistants'}
                </h2>
                <p className="text-xs text-emerald-400/60">
                  {isCreating
                    ? 'Define custom behavior, tools, and system directives'
                    : 'Specialized personas tailored for engineering, analysis & creativity'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-emerald-400/80 hover:text-emerald-100 hover:bg-emerald-950/60 transition-colors"
              aria-label="Close assistants"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {isCreating ? (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    Assistant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. UX Copywriter, Python Tutor"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b140f] border border-emerald-900/50 text-sm text-emerald-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    Short Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Expert in human-centric copy & microcopy"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b140f] border border-emerald-900/50 text-sm text-emerald-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    System Instructions *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Provide specific guidelines on tone, format, step-by-step reasoning, constraints, or knowledge."
                    className="w-full p-3.5 rounded-xl bg-[#0b140f] border border-emerald-900/50 text-xs text-emerald-100 outline-none focus:border-emerald-500 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
                  <span className="text-xs text-emerald-200 font-medium">
                    Enable Web Search Grounding
                  </span>
                  <input
                    type="checkbox"
                    checked={webSearchTool}
                    onChange={(e) => setWebSearchTool(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-xs font-medium border border-emerald-800/40"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors shadow-md"
                  >
                    Save & Activate
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">
                    Available Assistants ({assistants.length})
                  </span>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Custom</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assistants.map((ast) => {
                    const Icon = getIcon(ast.avatarIcon);
                    const isSelected = ast.id === activeAssistantId;

                    return (
                      <div
                        key={ast.id}
                        onClick={() => {
                          onSelectAssistant(ast);
                          onClose();
                        }}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                            : 'bg-[#0b140f] border-emerald-950/60 hover:border-emerald-700/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                              <Icon className="w-4 h-4" />
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Active</span>
                              </div>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm text-emerald-100">
                            {ast.name}
                          </h3>
                          <p className="text-xs text-emerald-400/80 font-medium mt-0.5">
                            {ast.tagline}
                          </p>
                          <p className="text-[11px] text-emerald-500/60 mt-2 line-clamp-2">
                            {ast.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
