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
import { Conversation, Project } from '../types';

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
      if (showArchived ? !conv.isArchived : conv.isArchived) {
        return false;
      }

      if (activeProject && conv.projectId !== activeProject.id) {
        return false;
      }

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

      {/* Drawer Panel - Light-Black Morph Surface */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -320,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 sm:w-80 bg-[#0A0A0A] border-r border-[#1A1A1A] flex flex-col shadow-2xl ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Top Header */}
        <div className="p-3.5 border-b border-[#1A1A1A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center text-[#FFFFFF] font-bold text-xs">
              GH
            </div>
            <span className="font-semibold text-sm text-[#FFFFFF] tracking-tight">
              GPT Hub
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-[#FFFFFF] hover:bg-[#171717] transition-colors"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#000000] font-semibold text-xs transition-all active:scale-98"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Chat</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10 text-black font-mono">
              ⌘N
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-3 pb-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-[#666666] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-[#111111] border border-[#222222] text-xs text-[#FFFFFF] placeholder-[#666666] outline-none focus:border-[#404040] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-[#737373] hover:text-[#FFFFFF]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Workspace banner if filtered */}
        {activeProject && (
          <div className="mx-3 mb-2 px-2.5 py-1.5 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <FolderOpen className="w-3.5 h-3.5 text-[#A3A3A3] flex-shrink-0" />
              <span className="text-[#D4D4D4] truncate">{activeProject.name}</span>
            </div>
            <button
              onClick={onOpenProjects}
              className="text-[10px] text-[#A3A3A3] hover:text-[#FFFFFF]"
            >
              Change
            </button>
          </div>
        )}

        {/* Archive Toggle Button */}
        <div className="px-3 pb-2 flex items-center justify-between text-[11px] text-[#737373]">
          <span>{showArchived ? 'Archived' : 'Recent Chats'}</span>
          <button
            onClick={() => setShowArchived((prev) => !prev)}
            className="hover:text-[#FFFFFF] transition-colors flex items-center gap-1"
          >
            {showArchived ? (
              <>
                <ArchiveRestore className="w-3 h-3" />
                <span>Show Active</span>
              </>
            ) : (
              <>
                <Archive className="w-3 h-3" />
                <span>Archived</span>
              </>
            )}
          </button>
        </div>

        {/* Scrollable Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-3.5 text-xs">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-[#666666]">
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
        <div className="p-3 border-t border-[#1A1A1A] space-y-0.5 bg-[#0A0A0A]">
          <button
            onClick={() => {
              onOpenAssistants();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#A3A3A3] hover:text-[#FFFFFF] hover:bg-[#141414] transition-all text-left"
          >
            <Bot className="w-4 h-4 text-[#A3A3A3]" />
            <span>AI Assistants (Hub GPTs)</span>
          </button>

          <button
            onClick={() => {
              onOpenProjects();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#A3A3A3] hover:text-[#FFFFFF] hover:bg-[#141414] transition-all text-left"
          >
            <FolderOpen className="w-4 h-4 text-[#A3A3A3]" />
            <span>Workspaces</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#A3A3A3] hover:text-[#FFFFFF] hover:bg-[#141414] transition-all text-left"
          >
            <Settings className="w-4 h-4 text-[#A3A3A3]" />
            <span>Settings & Memory</span>
          </button>

          {!isPro && (
            <button
              onClick={() => {
                onOpenPro();
                onClose();
              }}
              className="w-full mt-2 flex items-center justify-between p-2.5 rounded-xl bg-[#111111] hover:bg-[#171717] border border-[#222222] hover:border-[#333333] transition-all"
            >
              <div className="flex items-center gap-2">
                <Crown className="w-3.5 h-3.5 text-[#FFFFFF]" />
                <div className="text-left">
                  <div className="text-xs font-medium text-[#FFFFFF]">
                    Upgrade to Pro
                  </div>
                  <div className="text-[10px] text-[#737373]">
                    Deep reasoning & priority access
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
    <div className="space-y-0.5">
      <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#666666]">
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
                ? 'bg-[#171717] text-[#FFFFFF] border border-[#262626]'
                : 'text-[#A3A3A3] hover:bg-[#121212] hover:text-[#FFFFFF]'
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
                  className="flex-1 bg-[#141414] border border-[#333333] rounded px-1.5 py-0.5 text-xs text-[#FFFFFF] outline-none"
                />
                <button
                  onClick={() => onSaveRename(conv.id)}
                  className="p-1 rounded bg-[#FFFFFF] text-[#000000] hover:bg-[#E5E5E5]"
                >
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <>
                <div
                  onClick={() => onSelect(conv.id)}
                  className="flex items-center gap-2 flex-1 min-w-0 pr-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#666666] flex-shrink-0" />
                  <span className="truncate text-xs font-normal">
                    {conv.title || 'Untitled'}
                  </span>
                </div>

                {/* Hover action buttons */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(conv.id);
                    }}
                    className={`p-1 rounded text-[#737373] hover:text-[#FFFFFF] transition-colors ${
                      conv.isPinned ? 'text-[#FFFFFF]' : ''
                    }`}
                    title={conv.isPinned ? 'Unpin' : 'Pin'}
                    aria-label={conv.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className={`w-3 h-3 ${conv.isPinned ? 'fill-[#FFFFFF]' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartRename(conv);
                    }}
                    className="p-1 rounded text-[#737373] hover:text-[#FFFFFF] transition-colors"
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
                    className="p-1 rounded text-[#737373] hover:text-[#FFFFFF] transition-colors"
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
                    className="p-1 rounded text-[#737373] hover:text-[#FFFFFF] transition-colors"
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
