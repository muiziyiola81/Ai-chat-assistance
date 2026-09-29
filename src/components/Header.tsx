import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Plus,
  ChevronDown,
  Sparkles,
  BrainCircuit,
  Zap,
  Crown,
  Settings,
  Globe,
  FolderOpen,
  Bot,
} from 'lucide-react';
import { ModelId, Project, Assistant } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  currentModel: ModelId;
  onSelectModel: (model: ModelId) => void;
  thinkMode: boolean;
  setThinkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  activeProject?: Project;
  activeAssistant?: Assistant;
  onOpenProjects: () => void;
  onOpenAssistants: () => void;
  onOpenSettings: () => void;
  onOpenPro: () => void;
  isPro: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNewChat,
  currentModel,
  onSelectModel,
  thinkMode,
  setThinkMode,
  activeProject,
  activeAssistant,
  onOpenProjects,
  onOpenAssistants,
  onOpenSettings,
  onOpenPro,
  isPro,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const models: Array<{
    id: ModelId;
    name: string;
    badge: string;
    desc: string;
    icon: any;
  }> = [
    {
      id: 'gpt-hub-4.5',
      name: 'GPT Hub 4.5 Turbo',
      badge: 'Flagship',
      desc: 'Top-tier intelligence, multimodal, real-time web search.',
      icon: Sparkles,
    },
    {
      id: 'gpt-hub-reasoning',
      name: 'GPT Hub Reasoning',
      badge: 'Think Pro',
      desc: 'Extended deliberation for advanced coding, math & STEM.',
      icon: BrainCircuit,
    },
    {
      id: 'gpt-hub-fast',
      name: 'GPT Hub Fast',
      badge: 'Speed',
      desc: 'Instant latency for lightweight queries and drafting.',
      icon: Zap,
    },
  ];

  const activeModelObj = models.find((m) => m.id === currentModel) || models[0];

  return (
    <header className="w-full h-14 sm:h-16 px-3 sm:px-5 flex items-center justify-between border-b border-emerald-950/60 bg-[#070c09]/95 backdrop-blur-xl z-20 flex-shrink-0">
      {/* Left section: Sidebar toggle & Branding */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-emerald-400/80 hover:text-emerald-100 hover:bg-emerald-950/60 transition-colors"
          title="Toggle chat history"
          aria-label="Toggle chat history"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onNewChat}
          className="p-2 rounded-xl text-emerald-400/80 hover:text-emerald-100 hover:bg-emerald-950/60 transition-colors"
          title="Start new conversation"
          aria-label="Start new conversation"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Branding & Model Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setModelDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-emerald-950/60 transition-all border border-transparent hover:border-emerald-800/40"
            aria-expanded={modelDropdownOpen}
            aria-label="Select AI Model"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
              GH
            </div>
            <div className="flex items-center gap-1.5 text-left">
              <span className="font-semibold text-sm text-emerald-100 hidden xs:inline">
                GPT Hub
              </span>
              <span className="text-xs text-emerald-400/80 font-medium">
                {activeModelObj.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400/60 ml-0.5" />
            </div>
          </button>

          {/* Model Selector Dropdown */}
          {modelDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#09120e] border border-emerald-800/50 shadow-2xl p-2 z-50 glass-dropdown animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-400/70 border-b border-emerald-950/60">
                Select GPT Hub Model
              </div>
              <div className="space-y-1 mt-1">
                {models.map((m) => {
                  const Icon = m.icon;
                  const isSelected = m.id === currentModel;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectModel(m.id);
                        if (m.id === 'gpt-hub-reasoning') {
                          setThinkMode(true);
                        }
                        setModelDropdownOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left flex items-start gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-emerald-950/70 border border-emerald-700/50 text-emerald-100 shadow-sm'
                          : 'hover:bg-emerald-950/30 text-emerald-300/80 border border-transparent'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg mt-0.5 ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-emerald-950/40 text-emerald-500/60'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-emerald-100">
                            {m.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-400/60 mt-0.5 leading-snug">
                          {m.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center/Right Section: Active Context Pills & Account */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Active Assistant Pill */}
        {activeAssistant && activeAssistant.id !== 'default' && (
          <button
            onClick={onOpenAssistants}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/40 text-xs text-emerald-300 hover:border-emerald-500 transition-colors"
            title="Active Assistant"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span className="max-w-[100px] truncate">{activeAssistant.name}</span>
          </button>
        )}

        {/* Active Project Pill */}
        {activeProject && (
          <button
            onClick={onOpenProjects}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/40 text-xs text-emerald-300 hover:border-emerald-500 transition-colors"
            title="Active Workspace"
          >
            <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="max-w-[100px] truncate">{activeProject.name}</span>
          </button>
        )}

        {/* Pro Badge / Upgrade */}
        {isPro ? (
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
            <Crown className="w-3 h-3 fill-emerald-400" />
            <span>PRO</span>
          </div>
        ) : (
          <button
            onClick={onOpenPro}
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all active:scale-95"
            title="Upgrade to Pro"
            aria-label="Upgrade to Pro"
          >
            <Crown className="w-3.5 h-3.5 fill-black" />
            <span className="hidden xs:inline">Upgrade</span>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-emerald-400/80 hover:text-emerald-100 hover:bg-emerald-950/60 transition-colors"
          title="Settings & Preferences"
          aria-label="Settings & Preferences"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
