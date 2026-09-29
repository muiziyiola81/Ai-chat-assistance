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
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative z-10 w-full max-w-2xl bg-[#0A0A0A] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1A1A1A] bg-[#0E0E0E]">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#FFFFFF]" />
              <h2 className="text-sm font-semibold text-[#FFFFFF]">
                {isCreating ? 'Create Custom Assistant' : 'Explore Assistants'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#737373] hover:text-[#FFFFFF] hover:bg-[#171717] transition-colors"
              aria-label="Close assistants"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
            {isCreating ? (
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#FFFFFF] mb-1">
                    Assistant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Code Reviewer, Technical Writer"
                    className="w-full px-3 py-2 rounded-xl bg-[#111111] border border-[#262626] text-xs text-[#FFFFFF] outline-none focus:border-[#404040]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
                    Short Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Specialized in TypeScript & systems architecture"
                    className="w-full px-3 py-2 rounded-xl bg-[#111111] border border-[#262626] text-xs text-[#FFFFFF] outline-none focus:border-[#404040]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
                    System Instructions *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Directives on persona, response format, rules, and problem-solving method."
                    className="w-full p-2.5 rounded-xl bg-[#111111] border border-[#262626] text-xs text-[#FFFFFF] outline-none focus:border-[#404040] resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#111111] border border-[#222222]">
                  <span className="text-xs text-[#FFFFFF] font-medium">
                    Enable Web Grounding
                  </span>
                  <input
                    type="checkbox"
                    checked={webSearchTool}
                    onChange={(e) => setWebSearchTool(e.target.checked)}
                    className="accent-white w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] text-[#A3A3A3] text-xs font-medium border border-[#262626]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#000000] font-medium text-xs transition-colors"
                  >
                    Save & Activate
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider">
                    Available Assistants ({assistants.length})
                  </span>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#171717] hover:bg-[#222222] border border-[#262626] text-[#FFFFFF] text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Custom</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#141414] border-[#3A3A3A]'
                            : 'bg-[#0E0E0E] border-[#1F1F1F] hover:border-[#2A2A2A]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="p-1.5 rounded-lg bg-[#171717] border border-[#262626] text-[#FFFFFF]">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-1 text-[10px] font-medium text-[#FFFFFF] bg-[#1C1C1C] px-2 py-0.2 rounded-full border border-[#2E2E2E]">
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                <span>Active</span>
                              </div>
                            )}
                          </div>
                          <h3 className="font-medium text-xs text-[#FFFFFF]">
                            {ast.name}
                          </h3>
                          <p className="text-[11px] text-[#A3A3A3] mt-0.5">
                            {ast.tagline}
                          </p>
                          <p className="text-[11px] text-[#737373] mt-1.5 line-clamp-2">
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
