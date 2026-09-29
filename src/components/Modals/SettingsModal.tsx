import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Sliders,
  Sparkles,
  Volume2,
  Trash2,
  Shield,
  Download,
  Info,
  Check,
  Plus,
  Crown,
} from 'lucide-react';
import { UserSettings, UserMemory, ResponseStyle } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  memories: UserMemory[];
  onAddMemory: (content: string) => void;
  onDeleteMemory: (id: string) => void;
  onClearMemories: () => void;
  onClearAllChats: () => void;
  onOpenPro: () => void;
}

type SettingsTab =
  | 'chat'
  | 'instructions'
  | 'memory'
  | 'voice'
  | 'account'
  | 'data'
  | 'about';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearMemories,
  onClearAllChats,
  onOpenPro,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('chat');
  const [newMemoryText, setNewMemoryText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [clearChatConfirm, setClearChatConfirm] = useState(false);

  if (!isOpen) return null;

  const handleAddMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;
    onAddMemory(newMemoryText.trim());
    setNewMemoryText('');
  };

  const exportAllData = () => {
    setIsExporting(true);
    try {
      const allChats = localStorage.getItem('gpthub_conversations_v1') || '[]';
      const blob = new Blob([allChats], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gpthub_chats_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export error:', e);
    }
    setTimeout(() => setIsExporting(false), 800);
  };

  const voices = [
    { id: 'Kore', name: 'Kore (Calm & Articulate)', description: 'Balanced, natural studio-grade voice.' },
    { id: 'Puck', name: 'Puck (Energetic & Expressive)', description: 'Engaging, bright, and enthusiastic.' },
    { id: 'Fenrir', name: 'Fenrir (Deep & Resonant)', description: 'Authoritative, grounded, and clear.' },
    { id: 'Zephyr', name: 'Zephyr (Warm & Dynamic)', description: 'Thoughtful, gentle, and conversational.' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative z-10 w-full max-w-2xl bg-[#0A0A0A] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] max-h-[600px]"
        >
          {/* Sidebar Tabs */}
          <div className="w-full md:w-52 bg-[#0E0E0E] border-b md:border-b-0 md:border-r border-[#1A1A1A] p-2.5 flex md:flex-col overflow-x-auto md:overflow-y-auto space-x-1 md:space-x-0 md:space-y-1 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 mb-1 text-[#FFFFFF] font-semibold text-xs">
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings</span>
            </div>

            <TabButton
              active={activeTab === 'chat'}
              onClick={() => setActiveTab('chat')}
              icon={Sliders}
              label="Preferences"
            />
            <TabButton
              active={activeTab === 'instructions'}
              onClick={() => setActiveTab('instructions')}
              icon={Sparkles}
              label="Custom Instructions"
            />
            <TabButton
              active={activeTab === 'memory'}
              onClick={() => setActiveTab('memory')}
              icon={Shield}
              label="Memory"
            />
            <TabButton
              active={activeTab === 'voice'}
              onClick={() => setActiveTab('voice')}
              icon={Volume2}
              label="Voice & Audio"
            />
            <TabButton
              active={activeTab === 'account'}
              onClick={() => setActiveTab('account')}
              icon={User}
              label="Account & Plan"
            />
            <TabButton
              active={activeTab === 'data'}
              onClick={() => setActiveTab('data')}
              icon={Download}
              label="Data & Storage"
            />
            <TabButton
              active={activeTab === 'about'}
              onClick={() => setActiveTab('about')}
              icon={Info}
              label="About"
            />
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">
            {/* Top Close Bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#1A1A1A]">
              <span className="text-xs uppercase tracking-wider font-medium text-[#737373]">
                {activeTab}
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-[#737373] hover:text-[#FFFFFF] hover:bg-[#171717] transition-colors"
                aria-label="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
              {/* Chat Preferences Tab */}
              {activeTab === 'chat' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#FFFFFF] mb-1">
                      Response Style
                    </h3>
                    <p className="text-xs text-[#737373] mb-3">
                      Adjust how detailed or concise the assistant responses should be.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['concise', 'balanced', 'detailed'] as ResponseStyle[]).map(
                        (style) => (
                          <button
                            key={style}
                            onClick={() => onUpdateSettings({ responseStyle: style })}
                            className={`p-2.5 rounded-xl border text-center capitalize text-xs font-medium transition-all ${
                              settings.responseStyle === style
                                ? 'bg-[#FFFFFF] border-[#FFFFFF] text-[#000000]'
                                : 'bg-[#111111] border-[#262626] text-[#A3A3A3] hover:bg-[#171717] hover:text-[#FFFFFF]'
                            }`}
                          >
                            {style}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1A1A1A]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-xs text-[#FFFFFF]">
                          Auto-Scroll Stream
                        </div>
                        <div className="text-[11px] text-[#737373]">
                          Keep latest streamed text centered in view.
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          onUpdateSettings({ autoScroll: !settings.autoScroll })
                        }
                        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer border ${
                          settings.autoScroll
                            ? 'bg-[#FFFFFF] border-[#FFFFFF]'
                            : 'bg-[#171717] border-[#333333]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                            settings.autoScroll
                              ? 'translate-x-5 bg-[#000000]'
                              : 'translate-x-0.5 bg-[#737373]'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Instructions */}
              {activeTab === 'instructions' && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#FFFFFF] mb-1">
                      Custom Instructions
                    </h3>
                    <p className="text-xs text-[#737373] mb-3 leading-relaxed">
                      What would you like GPT Hub to know about you to provide better responses?
                    </p>
                    <textarea
                      value={settings.customInstructions}
                      onChange={(e) =>
                        onUpdateSettings({ customInstructions: e.target.value })
                      }
                      rows={5}
                      placeholder="e.g. I work with TypeScript and Python. Provide clean, well-tested code without unnecessary filler."
                      className="w-full p-3 rounded-xl bg-[#111111] border border-[#262626] text-[#FFFFFF] text-xs leading-relaxed outline-none focus:border-[#404040] resize-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Memory Tab */}
              {activeTab === 'memory' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[#FFFFFF]">
                        Personalization & Memory
                      </h3>
                      <p className="text-xs text-[#737373]">
                        Allow GPT Hub to recall helpful user context across chats.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateSettings({ memoryEnabled: !settings.memoryEnabled })
                      }
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer border ${
                        settings.memoryEnabled
                          ? 'bg-[#FFFFFF] border-[#FFFFFF]'
                          : 'bg-[#171717] border-[#333333]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                          settings.memoryEnabled
                            ? 'translate-x-5 bg-[#000000]'
                            : 'translate-x-0.5 bg-[#737373]'
                        }`}
                      />
                    </button>
                  </div>

                  <form onSubmit={handleAddMemorySubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={newMemoryText}
                      onChange={(e) => setNewMemoryText(e.target.value)}
                      placeholder="Add a new memory (e.g. 'Prefers dark monochrome UI')"
                      className="flex-1 px-3 py-2 rounded-xl bg-[#111111] border border-[#262626] text-xs text-[#FFFFFF] outline-none focus:border-[#404040]"
                    />
                    <button
                      type="submit"
                      disabled={!newMemoryText.trim()}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#E5E5E5] disabled:opacity-30 text-[#000000] font-semibold text-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </form>

                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-center justify-between text-xs text-[#737373] font-medium">
                      <span>Saved Facts ({memories.length})</span>
                      {memories.length > 0 && (
                        <button
                          onClick={onClearMemories}
                          className="text-[#A3A3A3] hover:text-[#FFFFFF] transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {memories.length === 0 ? (
                      <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] text-xs text-[#666666] text-center">
                        No saved memories yet.
                      </div>
                    ) : (
                      memories.map((mem) => (
                        <div
                          key={mem.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#111111] border border-[#222222] text-xs text-[#D4D4D4]"
                        >
                          <span className="flex-1 pr-2">{mem.content}</span>
                          <button
                            onClick={() => onDeleteMemory(mem.id)}
                            className="p-1 rounded text-[#737373] hover:text-[#FFFFFF] transition-colors"
                            aria-label="Delete memory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Voice Tab */}
              {activeTab === 'voice' && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#FFFFFF] mb-1">
                      Spoken Response Voice
                    </h3>
                    <p className="text-xs text-[#737373] mb-3">
                      Select voice model for reading AI responses aloud.
                    </p>
                    <div className="space-y-2">
                      {voices.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => onUpdateSettings({ speechVoice: v.id })}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                            settings.speechVoice === v.id
                              ? 'bg-[#171717] border-[#404040] text-[#FFFFFF]'
                              : 'bg-[#111111] border-[#222222] text-[#A3A3A3] hover:bg-[#141414] hover:text-[#FFFFFF]'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-xs text-[#FFFFFF]">
                              {v.name}
                            </div>
                            <div className="text-[11px] text-[#737373]">
                              {v.description}
                            </div>
                          </div>
                          {settings.speechVoice === v.id && (
                            <Check className="w-4 h-4 text-[#FFFFFF]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Account & Plan Tab */}
              {activeTab === 'account' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#FFFFFF] text-sm">
                          {settings.userName}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full font-medium bg-[#1F1F1F] border border-[#333333] text-[#D4D4D4]">
                          {settings.isPro ? 'Pro Member' : 'Standard'}
                        </span>
                      </div>
                      <div className="text-xs text-[#737373] mt-0.5">
                        {settings.userEmail}
                      </div>
                    </div>
                    {!settings.isPro && (
                      <button
                        onClick={onOpenPro}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#000000] font-medium text-xs transition-all active:scale-95"
                      >
                        <Crown className="w-3.5 h-3.5 fill-[#000000]" />
                        <span>Upgrade</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Data & Storage Tab */}
              {activeTab === 'data' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222222] flex items-center justify-between">
                    <div>
                      <div className="font-medium text-xs text-[#FFFFFF]">
                        Export Chats (JSON)
                      </div>
                      <div className="text-[11px] text-[#737373]">
                        Download local conversation history.
                      </div>
                    </div>
                    <button
                      onClick={exportAllData}
                      disabled={isExporting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222222] border border-[#2A2A2A] text-[#FFFFFF] text-xs font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222222] flex items-center justify-between">
                    <div>
                      <div className="font-medium text-xs text-[#FFFFFF]">
                        Clear All Chats
                      </div>
                      <div className="text-[11px] text-[#737373]">
                        Permanently delete all local chats.
                      </div>
                    </div>
                    {clearChatConfirm ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onClearAllChats();
                            setClearChatConfirm(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#FFFFFF] text-[#000000] text-xs font-semibold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setClearChatConfirm(false)}
                          className="px-2.5 py-1 rounded-lg bg-[#222222] text-xs text-[#A3A3A3]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setClearChatConfirm(true)}
                        className="px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222222] border border-[#2A2A2A] text-[#A3A3A3] hover:text-[#FFFFFF] text-xs font-medium transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="space-y-3 text-xs text-[#A3A3A3] leading-relaxed">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#111111] border border-[#222222]">
                    <div className="w-9 h-9 rounded-xl bg-[#171717] border border-[#262626] flex items-center justify-center text-[#FFFFFF] font-bold text-sm">
                      GH
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#FFFFFF] text-sm">
                        GPT Hub
                      </h4>
                      <p className="text-[11px] text-[#737373]">
                        Monochrome Edition 2.5.0
                      </p>
                    </div>
                  </div>
                  <p>
                    GPT Hub delivers clean, modern AI interactions with progressive stream synthesis, deep reasoning Think Mode, and verified search grounding.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left whitespace-nowrap md:whitespace-normal ${
      active
        ? 'bg-[#171717] text-[#FFFFFF] border border-[#262626]'
        : 'text-[#737373] hover:text-[#FFFFFF] hover:bg-[#141414]'
    }`}
  >
    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
    <span>{label}</span>
  </button>
);
