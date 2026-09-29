import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Search,
  MessageSquare,
  Pin,
  Archive,
  Trash2,
  Edit2,
  FolderOpen,
  Bot,
  Settings,
  Crown,
  ArchiveRestore,
  Check,
} from 'lucide-react';
import { Conversation, Project, Assistant } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePinConversation: (id: string) => void;
  onToggleArchiveConversation: (id: string) => void;
  onOpenProjects: () => void;
  onOpenAssistants: () => void;
  onOpenSettings: () => void;
  onOpenPro: () => void;
  isPro: boolean;
  activeProject?: Project;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onTogglePinConversation,
  onToggleArchiveConversation,
  onOpenProjects,
  onOpenAssistants,
  onOpenSettings,
  onOpenPro,
  isPro,
  activeProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // Archived filter
      if (showArchived ? !conv.isArchived : conv.isArchived) {
        return false;
      }

      // Project filter
      if (activeProject && conv.projectId !== activeProject.id) {
        return false;
      }

      // Search query filter (matches title or any message content!)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = conv.title.toLowerCase().includes(query);
        const matchesMessage = conv.messages.some((m) =>
          m.content.toLowerCase().includes(query)
        );
        return matchesTitle || matchesMessage;
      }

      return true;
    });
  }, [conversations, showArchived, activeProject, searchQuery]);

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const pinned: Conversation[] = [];
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const last7Days: Conversation[] = [];
    const older: Conversation[] = [];

    const now = Date.now();
    const oneDay = 86400000;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const yesterdayStart = todayStart - oneDay;
    const sevenDaysAgo = todayStart - 6 * oneDay;

    filteredConversations.forEach((conv) => {
      if (conv.isPinned && !showArchived) {
        pinned.push(conv);
        return;
      }

      const time = conv.updatedAt || conv.createdAt;
      if (time >= todayStart) {
        today.push(conv);
      } else if (time >= yesterdayStart) {
        yesterday.push(conv);
      } else if (time >= sevenDaysAgo) {
        last7Days.push(conv);
      } else {
        older.push(conv);
      }
    });

    return { pinned, today, yesterday, last7Days, older };
  }, [filteredConversations, showArchived]);

  const handleStartRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Drawer Panel */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -320,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 sm:w-80 bg-[#070d0a] border-r border-emerald-950/70 flex flex-col shadow-2xl ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Top Header */}
        <div className="p-3.5 border-b border-emerald-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
              GH
            </div>
            <span className="font-bold text-sm text-emerald-100 tracking-tight">
              GPT Hub
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-400/80 hover:text-emerald-100 hover:bg-emerald-950/60 transition-colors"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-98"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Chat</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-black/90 font-mono">
              ⌘N
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-3 pb-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-emerald-500/60 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-[#09140e] border border-emerald-950/80 text-xs text-emerald-100 placeholder-emerald-600/60 outline-none focus:border-emerald-600/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-emerald-400/70 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Workspace banner if filtered */}
        {activeProject && (
          <div className="mx-3 mb-2 px-2.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <FolderOpen className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-emerald-200 truncate">{activeProject.name}</span>
            </div>
            <button
              onClick={onOpenProjects}
              className="text-[10px] text-emerald-400/80 hover:text-white"
            >
              Change
            </button>
          </div>
        )}

        {/* Archive Toggle Button */}
        <div className="px-3 pb-2 flex items-center justify-between text-[11px] text-emerald-400/70">
          <span>{showArchived ? 'Archived Chats' : 'Chat History'}</span>
          <button
            onClick={() => setShowArchived((prev) => !prev)}
            className="hover:text-emerald-200 transition-colors flex items-center gap-1"
          >
            {showArchived ? (
              <>
                <ArchiveRestore className="w-3 h-3" />
                <span>Show Active</span>
              </>
            ) : (
              <>
                <Archive className="w-3 h-3" />
                <span>Show Archived</span>
              </>
            )}
          </button>
        </div>

        {/* Scrollable Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 text-xs">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-emerald-500/50">
              {searchQuery ? 'No matching chats found.' : 'No conversations yet.'}
            </div>
          ) : (
            <>
              {groupedConversations.pinned.length > 0 && (
                <ConversationSection
                  title="Pinned"
                  conversations={groupedConversations.pinned}
                  currentId={currentConversationId}
                  editingId={editingId}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  onSelect={(id) => {
                    onSelectConversation(id);
                    onClose();
                  }}
                  onSaveRename={handleSaveRename}
                  onStartRename={handleStartRename}
                  onTogglePin={onTogglePinConversation}
                  onToggleArchive={onToggleArchiveConversation}
                  onDelete={onDeleteConversation}
                />
              )}

              {groupedConversations.today.length > 0 && (
                <ConversationSection
                  title="Today"
                  conversations={groupedConversations.today}
                  currentId={currentConversationId}
                  editingId={editingId}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  onSelect={(id) => {
                    onSelectConversation(id);
                    onClose();
                  }}
                  onSaveRename={handleSaveRename}
                  onStartRename={handleStartRename}
                  onTogglePin={onTogglePinConversation}
                  onToggleArchive={onToggleArchiveConversation}
                  onDelete={onDeleteConversation}
                />
              )}

              {groupedConversations.yesterday.length > 0 && (
                <ConversationSection
                  title="Yesterday"
                  conversations={groupedConversations.yesterday}
                  currentId={currentConversationId}
                  editingId={editingId}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  onSelect={(id) => {
                    onSelectConversation(id);
                    onClose();
                  }}
                  onSaveRename={handleSaveRename}
                  onStartRename={handleStartRename}
                  onTogglePin={onTogglePinConversation}
                  onToggleArchive={onToggleArchiveConversation}
                  onDelete={onDeleteConversation}
                />
              )}

              {groupedConversations.last7Days.length > 0 && (
                <ConversationSection
                  title="Previous 7 Days"
                  conversations={groupedConversations.last7Days}
                  currentId={currentConversationId}
                  editingId={editingId}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  onSelect={(id) => {
                    onSelectConversation(id);
                    onClose();
                  }}
                  onSaveRename={handleSaveRename}
                  onStartRename={handleStartRename}
                  onTogglePin={onTogglePinConversation}
                  onToggleArchive={onToggleArchiveConversation}
                  onDelete={onDeleteConversation}
                />
              )}

              {groupedConversations.older.length > 0 && (
                <ConversationSection
                  title="Older"
                  conversations={groupedConversations.older}
                  currentId={currentConversationId}
                  editingId={editingId}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  onSelect={(id) => {
                    onSelectConversation(id);
                    onClose();
                  }}
                  onSaveRename={handleSaveRename}
                  onStartRename={handleStartRename}
                  onTogglePin={onTogglePinConversation}
                  onToggleArchive={onToggleArchiveConversation}
                  onDelete={onDeleteConversation}
                />
              )}
            </>
          )}
        </div>

        {/* Bottom Drawer Actions */}
        <div className="p-3 border-t border-emerald-950/60 space-y-1 bg-[#09120e]">
          <button
            onClick={() => {
              onOpenAssistants();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-300/80 hover:text-emerald-100 hover:bg-emerald-950/60 transition-all text-left"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>AI Assistants (Hub GPTs)</span>
          </button>

          <button
            onClick={() => {
              onOpenProjects();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-300/80 hover:text-emerald-100 hover:bg-emerald-950/60 transition-all text-left"
          >
            <FolderOpen className="w-4 h-4 text-emerald-400" />
            <span>Workspaces & Projects</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-300/80 hover:text-emerald-100 hover:bg-emerald-950/60 transition-all text-left"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>Settings & Memory</span>
          </button>

          {!isPro && (
            <button
              onClick={() => {
                onOpenPro();
                onClose();
              }}
              className="w-full mt-2 flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-950 to-[#0d1d14] border border-emerald-700/50 hover:border-emerald-500 transition-all"
            >
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <div className="text-left">
                  <div className="text-xs font-semibold text-emerald-100">
                    Upgrade to Pro
                  </div>
                  <div className="text-[10px] text-emerald-400/70">
                    Think Mode & Unlimited Grounding
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
};

const ConversationSection: React.FC<{
  title: string;
  conversations: Conversation[];
  currentId: string | null;
  editingId: string | null;
  editTitle: string;
  setEditTitle: (val: string) => void;
  onSelect: (id: string) => void;
  onSaveRename: (id: string) => void;
  onStartRename: (conv: Conversation) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({
  title,
  conversations,
  currentId,
  editingId,
  editTitle,
  setEditTitle,
  onSelect,
  onSaveRename,
  onStartRename,
  onTogglePin,
  onToggleArchive,
  onDelete,
}) => {
  return (
    <div className="space-y-1">
      <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-500/60">
        {title}
      </div>
      {conversations.map((conv) => {
        const isSelected = conv.id === currentId;
        const isEditing = conv.id === editingId;

        return (
          <div
            key={conv.id}
            className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer ${
              isSelected
                ? 'bg-emerald-950/80 text-emerald-100 border border-emerald-700/50 shadow-sm'
                : 'text-emerald-300/80 hover:bg-emerald-950/40 hover:text-emerald-100'
            }`}
          >
            {isEditing ? (
              <div className="flex items-center gap-1.5 w-full">
                <input
                  type="text"
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSaveRename(conv.id);
                  }}
                  className="flex-1 bg-emerald-950/90 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-white outline-none"
                />
                <button
                  onClick={() => onSaveRename(conv.id)}
                  className="p-1 rounded bg-emerald-500 text-black hover:bg-emerald-400"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>
              </div>
            ) : (
              <>
                <div
                  onClick={() => onSelect(conv.id)}
                  className="flex items-center gap-2 flex-1 min-w-0 pr-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500/70 flex-shrink-0" />
                  <span className="truncate text-xs font-normal">
                    {conv.title || 'Untitled Chat'}
                  </span>
                </div>

                {/* Hover action buttons */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(conv.id);
                    }}
                    className={`p-1 rounded text-emerald-400 hover:text-white transition-colors ${
                      conv.isPinned ? 'text-emerald-300' : ''
                    }`}
                    title={conv.isPinned ? 'Unpin' : 'Pin'}
                    aria-label={conv.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className={`w-3 h-3 ${conv.isPinned ? 'fill-emerald-400' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartRename(conv);
                    }}
                    className="p-1 rounded text-emerald-400 hover:text-white transition-colors"
                    title="Rename"
                    aria-label="Rename"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleArchive(conv.id);
                    }}
                    className="p-1 rounded text-emerald-400 hover:text-white transition-colors"
                    title={conv.isArchived ? 'Restore' : 'Archive'}
                    aria-label={conv.isArchived ? 'Restore' : 'Archive'}
                  >
                    <Archive className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="p-1 rounded text-emerald-400 hover:text-red-400 transition-colors"
                    title="Delete"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
