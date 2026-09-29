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
      badge: 'Default',
      desc: 'Balanced intelligence, multimodal understanding & search.',
      icon: Sparkles,
    },
    {
      id: 'gpt-hub-reasoning',
      name: 'GPT Hub Reasoning',
      badge: 'Reasoning',
      desc: 'Extended thinking for logic, coding, and difficult queries.',
      icon: BrainCircuit,
    },
    {
      id: 'gpt-hub-fast',
      name: 'GPT Hub Fast',
      badge: 'Instant',
      desc: 'Low-latency responses for quick questions and drafts.',
      icon: Zap,
    },
  ];

  const activeModelObj = models.find((m) => m.id === currentModel) || models[0];

  return (
    <header className="w-full h-14 sm:h-15 px-3 sm:px-4 flex items-center justify-between border-b border-[#1A1A1A] bg-[#000000] z-20 flex-shrink-0">
      {/* Left section: Sidebar toggle & Branding */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#A3A3A3] hover:text-[#FFFFFF] hover:bg-[#141414] active:bg-[#1C1C1C] transition-all"
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </button>

        <button
          onClick={onNewChat}
          className="p-2 rounded-xl text-[#A3A3A3] hover:text-[#FFFFFF] hover:bg-[#141414] active:bg-[#1C1C1C] transition-all"
          title="New Chat (⌘N)"
          aria-label="New Chat"
        >
          <Plus className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </button>

        {/* Model Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setModelDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#141414] active:bg-[#1C1C1C] transition-all border border-transparent hover:border-[#222222]"
            aria-expanded={modelDropdownOpen}
            aria-label="Select AI Model"
          >
            <div className="w-6 h-6 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center text-[#FFFFFF] font-bold text-xs">
              GH
            </div>
            <div className="flex items-center gap-1.5 text-left">
              <span className="font-semibold text-sm text-[#FFFFFF] hidden xs:inline">
                GPT Hub
              </span>
              <span className="text-xs text-[#A3A3A3] font-medium">
                {activeModelObj.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#737373] ml-0.5" />
            </div>
          </button>

          {/* Model Selector Dropdown Menu */}
          {modelDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#0A0A0A] border border-[#262626] shadow-2xl p-2 z-50 glass-dropdown animate-in fade-in duration-150">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#737373] border-b border-[#1A1A1A]">
                Select Model
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
                          ? 'bg-[#171717] border border-[#333333] text-[#FFFFFF]'
                          : 'hover:bg-[#141414] text-[#A3A3A3] border border-transparent'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg mt-0.5 ${
                          isSelected
                            ? 'bg-[#222222] text-[#FFFFFF]'
                            : 'bg-[#141414] text-[#737373]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-[#FFFFFF]">
                            {m.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1C1C1C] border border-[#2A2A2A] text-[#A3A3A3]">
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#737373] mt-0.5 leading-snug">
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

      {/* Center/Right Section: Active Context Pills & Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Active Assistant Pill */}
        {activeAssistant && activeAssistant.id !== 'default' && (
          <button
            onClick={onOpenAssistants}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111111] border border-[#222222] text-xs text-[#D4D4D4] hover:border-[#3A3A3A] transition-colors"
            title="Active Assistant"
          >
            <Bot className="w-3.5 h-3.5 text-[#A3A3A3]" />
            <span className="max-w-[100px] truncate">{activeAssistant.name}</span>
          </button>
        )}

        {/* Active Project Pill */}
        {activeProject && (
          <button
            onClick={onOpenProjects}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111111] border border-[#222222] text-xs text-[#D4D4D4] hover:border-[#3A3A3A] transition-colors"
            title="Active Workspace"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#A3A3A3]" />
            <span className="max-w-[100px] truncate">{activeProject.name}</span>
          </button>
        )}

        {/* Pro Badge / Upgrade */}
        {isPro ? (
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#171717] border border-[#262626] text-[11px] font-semibold text-[#FFFFFF]">
            <Crown className="w-3 h-3 fill-[#FFFFFF]" />
            <span>PRO</span>
          </div>
        ) : (
          <button
            onClick={onOpenPro}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#000000] text-xs font-semibold transition-all active:scale-95"
            title="Upgrade to Pro"
            aria-label="Upgrade to Pro"
          >
            <Crown className="w-3 h-3 fill-[#000000]" />
            <span className="hidden xs:inline">Upgrade</span>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-[#A3A3A3] hover:text-[#FFFFFF] hover:bg-[#141414] active:bg-[#1C1C1C] transition-colors"
          title="Settings & Memory"
          aria-label="Settings & Memory"
        >
          <Settings className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>
    </header>
  );
};
