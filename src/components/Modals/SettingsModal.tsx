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
  Moon,
  Sun,
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
  | 'account'
  | 'appearance'
  | 'chat'
  | 'memory'
  | 'instructions'
  | 'voice'
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
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
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
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative z-10 w-full max-w-2xl bg-[#08100c] border border-emerald-800/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] max-h-[640px]"
        >
          {/* Sidebar Tabs */}
          <div className="w-full md:w-56 bg-[#0a140f] border-b md:border-b-0 md:border-r border-emerald-900/40 p-3 flex md:flex-col overflow-x-auto md:overflow-y-auto space-x-1 md:space-x-0 md:space-y-1 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2 px-3 py-2.5 mb-2 text-emerald-400 font-semibold text-sm">
              <Sliders className="w-4 h-4" />
              <span>Settings</span>
            </div>

            <TabButton
              active={activeTab === 'appearance'}
              onClick={() => setActiveTab('appearance')}
              icon={Moon}
              label="Appearance"
            />
            <TabButton
              active={activeTab === 'chat'}
              onClick={() => setActiveTab('chat')}
              icon={Sliders}
              label="Chat Preferences"
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
          <div className="flex-1 flex flex-col overflow-hidden bg-[#070e0a]">
            {/* Top Close Bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-900/30">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400/80">
                {activeTab}
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-emerald-400/80 hover:text-emerald-100 hover:bg-emerald-950/60 transition-colors"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-medium text-emerald-100 mb-1">
                      Theme
                    </h3>
                    <p className="text-xs text-emerald-400/70 mb-3">
                      Select your interface color scheme. GPT Hub's default is the signature premium dark emerald.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => onUpdateSettings({ theme: 'dark' })}
                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                          settings.theme === 'dark'
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'bg-[#0b140f] border-emerald-900/40 text-emerald-400/70 hover:border-emerald-700/50'
                        }`}
                      >
                        <Moon className="w-6 h-6 text-emerald-400" />
                        <span className="font-medium text-xs">Dark Emerald (Default)</span>
                      </button>
                      <button
                        onClick={() => onUpdateSettings({ theme: 'light' })}
                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                          settings.theme === 'light'
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'bg-[#0b140f] border-emerald-900/40 text-emerald-400/70 hover:border-emerald-700/50'
                        }`}
                      >
                        <Sun className="w-6 h-6 text-emerald-400" />
                        <span className="font-medium text-xs">Light Scheme</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Preferences Tab */}
              {activeTab === 'chat' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-medium text-emerald-100 mb-1">
                      Response Style
                    </h3>
                    <p className="text-xs text-emerald-400/70 mb-3">
                      Configure how the AI structures its replies across all sessions.
                    </p>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(['concise', 'balanced', 'detailed'] as ResponseStyle[]).map(
                        (style) => (
                          <button
                            key={style}
                            onClick={() => onUpdateSettings({ responseStyle: style })}
                            className={`p-3 rounded-xl border text-center capitalize text-xs font-medium transition-all ${
                              settings.responseStyle === style
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                : 'bg-[#0b140f] border-emerald-950/60 text-emerald-400/70 hover:border-emerald-700/40'
                            }`}
                          >
                            {style}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-900/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-emerald-100">Auto-Scroll During Stream</div>
                        <div className="text-xs text-emerald-400/70">
                          Smoothly keep current streaming text centered in view.
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          onUpdateSettings({ autoScroll: !settings.autoScroll })
                        }
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          settings.autoScroll ? 'bg-emerald-500' : 'bg-emerald-950 border border-emerald-800'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                            settings.autoScroll ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Instructions */}
              {activeTab === 'instructions' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-medium text-emerald-100 mb-1">
                      Custom Instructions
                    </h3>
                    <p className="text-xs text-emerald-400/70 mb-3 leading-relaxed">
                      What would you like GPT Hub to know about you to provide better responses?
                      (e.g., tone preferences, preferred languages, formatting requirements)
                    </p>
                    <textarea
                      value={settings.customInstructions}
                      onChange={(e) =>
                        onUpdateSettings({ customInstructions: e.target.value })
                      }
                      rows={5}
                      placeholder="e.g. I am a TypeScript developer. Always prioritize strict types, functional clean code, and avoid unnecessary comments."
                      className="w-full p-3.5 rounded-2xl bg-[#0b140f] border border-emerald-900/50 text-[#d8e3db] text-xs leading-relaxed outline-none focus:border-emerald-500/80 resize-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Memory Tab */}
              {activeTab === 'memory' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-emerald-100">
                        Personalization & Memory
                      </h3>
                      <p className="text-xs text-emerald-400/70">
                        Enable GPT Hub to recall personal context between chats.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateSettings({ memoryEnabled: !settings.memoryEnabled })
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        settings.memoryEnabled ? 'bg-emerald-500' : 'bg-emerald-950 border border-emerald-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                          settings.memoryEnabled ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Add Memory Form */}
                  <form onSubmit={handleAddMemorySubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={newMemoryText}
                      onChange={(e) => setNewMemoryText(e.target.value)}
                      placeholder="Add a new memory (e.g., 'Prefers Tailwind CSS')"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#0b140f] border border-emerald-900/40 text-xs text-emerald-100 outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMemoryText.trim()}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-semibold text-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </form>

                  {/* Memories List */}
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between text-xs text-emerald-400/80 font-medium">
                      <span>Saved Memories ({memories.length})</span>
                      {memories.length > 0 && (
                        <button
                          onClick={onClearMemories}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {memories.length === 0 ? (
                      <div className="p-4 rounded-xl bg-[#0b140f] border border-emerald-950/60 text-xs text-emerald-500/60 text-center">
                        No memories recorded yet.
                      </div>
                    ) : (
                      memories.map((mem) => (
                        <div
                          key={mem.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b140f] border border-emerald-950/60 text-xs text-[#dbe5de]"
                        >
                          <span className="flex-1 pr-2">{mem.content}</span>
                          <button
                            onClick={() => onDeleteMemory(mem.id)}
                            className="p-1 rounded text-emerald-500/60 hover:text-red-400 transition-colors"
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
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-medium text-emerald-100 mb-1">
                      AI Voice Persona
                    </h3>
                    <p className="text-xs text-emerald-400/70 mb-3">
                      Select the prebuilt voice model used for spoken AI responses.
                    </p>
                    <div className="space-y-2.5">
                      {voices.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => onUpdateSettings({ speechVoice: v.id })}
                          className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            settings.speechVoice === v.id
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                              : 'bg-[#0b140f] border-emerald-950/60 text-emerald-400/70 hover:border-emerald-700/40'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-xs text-emerald-200">
                              {v.name}
                            </div>
                            <div className="text-[11px] text-emerald-400/60">
                              {v.description}
                            </div>
                          </div>
                          {settings.speechVoice === v.id && (
                            <Check className="w-4 h-4 text-emerald-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Account & Plan Tab */}
              {activeTab === 'account' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-[#0c1611] border border-emerald-800/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-100 text-sm">
                          {settings.userName}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            settings.isPro
                              ? 'bg-emerald-500 text-black'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                          }`}
                        >
                          {settings.isPro ? 'Pro Member' : 'Free Tier'}
                        </span>
                      </div>
                      <div className="text-xs text-emerald-400/70 mt-0.5">
                        {settings.userEmail}
                      </div>
                    </div>
                    {!settings.isPro && (
                      <button
                        onClick={onOpenPro}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
                      >
                        <Crown className="w-3.5 h-3.5 fill-black" />
                        <span>Upgrade</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Data & Storage Tab */}
              {activeTab === 'data' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-medium text-emerald-100 mb-1">
                      Data Export & Privacy
                    </h3>
                    <p className="text-xs text-emerald-400/70 mb-3">
                      Export your complete conversation history or reset local data.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0b140f] border border-emerald-950/60 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-xs text-emerald-100">
                        Export Conversations (JSON)
                      </div>
                      <div className="text-[11px] text-emerald-400/60">
                        Download all active conversations and message logs.
                      </div>
                    </div>
                    <button
                      onClick={exportAllData}
                      disabled={isExporting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 text-xs font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0b140f] border border-red-950/60 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-xs text-red-200">
                        Delete All Chats
                      </div>
                      <div className="text-[11px] text-red-400/60">
                        Permanently removes all local conversations.
                      </div>
                    </div>
                    {clearChatConfirm ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onClearAllChats();
                            setClearChatConfirm(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setClearChatConfirm(false)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 text-xs text-neutral-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setClearChatConfirm(true)}
                        className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-medium transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="space-y-4 text-xs text-emerald-300/80 leading-relaxed">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#0b140f] border border-emerald-900/40">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-base">
                      GH
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-100 text-sm">
                        GPT Hub
                      </h4>
                      <p className="text-[11px] text-emerald-400/60">
                        Version 2.4.0 • Enterprise Emerald Edition
                      </p>
                    </div>
                  </div>
                  <p>
                    GPT Hub is built for high-performance generative interaction, deep reasoning, live web grounding, and specialized multi-modal tasks.
                  </p>
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-[11px] space-y-1">
                    <div>• Progressive streaming via Server-Sent Events (SSE)</div>
                    <div>• Google Search grounding with direct citation verification</div>
                    <div>• Multi-turn conversational memory & projects workspace</div>
                    <div>• Live camera and device attachment visual inspection</div>
                  </div>
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
    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left whitespace-nowrap md:whitespace-normal ${
      active
        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 shadow-sm'
        : 'text-emerald-400/70 hover:text-emerald-100 hover:bg-emerald-950/40'
    }`}
  >
    <Icon className="w-4 h-4 flex-shrink-0" />
    <span>{label}</span>
  </button>
);
