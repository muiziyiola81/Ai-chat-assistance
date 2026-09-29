import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { Composer } from './components/Composer';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ImageViewerModal } from './components/Modals/ImageViewerModal';
import { CameraModal } from './components/Modals/CameraModal';
import { ToolsModal } from './components/Modals/ToolsModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { ProModal } from './components/Modals/ProModal';
import { ShareModal } from './components/Modals/ShareModal';
import { ProjectsModal } from './components/Modals/ProjectsModal';
import { AssistantsModal } from './components/Modals/AssistantsModal';
import { StorageService } from './services/storage';
import { ApiService } from './services/api';
import {
  Conversation,
  Message,
  Attachment,
  ModelId,
  Project,
  Assistant,
  UserMemory,
  UserSettings,
} from './types';
import { WifiOff } from 'lucide-react';

export default function App() {
  // Persistent State from Storage
  const [settings, setSettings] = useState<UserSettings>(() =>
    StorageService.getSettings()
  );
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    StorageService.getConversations()
  );
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    () => StorageService.getCurrentConversationId()
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    StorageService.getProjects()
  );
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(
    undefined
  );
  const [assistants, setAssistants] = useState<Assistant[]>(() =>
    StorageService.getAssistants()
  );
  const [activeAssistantId, setActiveAssistantId] = useState<string>('default');
  const [memories, setMemories] = useState<UserMemory[]>(() =>
    StorageService.getMemories()
  );

  // Runtime Chat & Composer State
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelId>(
    settings.defaultModel || 'gpt-hub-4.5'
  );
  const [thinkMode, setThinkMode] = useState<boolean>(settings.thinkModeDefault);
  const [webSearch, setWebSearch] = useState<boolean>(settings.webSearchDefault);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Modals state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [assistantsOpen, setAssistantsOpen] = useState(false);
  const [activeImageForViewer, setActiveImageForViewer] = useState<Attachment | null>(
    null
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  // Apply Theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [settings.theme]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save changes to storage
  useEffect(() => {
    StorageService.saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    StorageService.setCurrentConversationId(currentConversationId);
  }, [currentConversationId]);

  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    StorageService.saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    StorageService.saveAssistants(assistants);
  }, [assistants]);

  useEffect(() => {
    StorageService.saveMemories(memories);
  }, [memories]);

  // Active objects
  const currentConversation = useMemo(() => {
    if (!currentConversationId) return null;
    return conversations.find((c) => c.id === currentConversationId) || null;
  }, [conversations, currentConversationId]);

  const activeProject = useMemo(() => {
    if (!activeProjectId) return undefined;
    return projects.find((p) => p.id === activeProjectId);
  }, [projects, activeProjectId]);

  const activeAssistant = useMemo(() => {
    return (
      assistants.find((a) => a.id === activeAssistantId) || assistants[0]
    );
  }, [assistants, activeAssistantId]);

  // Keyboard Shortcuts (Cmd+N for new chat, Esc for stop/close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGenerating]);

  // Create New Chat
  const handleNewChat = () => {
    if (isGenerating) {
      handleStop();
    }
    setCurrentConversationId(null);
    setInput('');
    setAttachments([]);
  };

  // Select a Conversation
  const handleSelectConversation = (id: string) => {
    if (isGenerating) {
      handleStop();
    }
    setCurrentConversationId(id);
    setInput('');
    setAttachments([]);
  };

  // Delete Conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  };

  // Rename Conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Toggle Pin
  const handleTogglePinConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  // Toggle Archive
  const handleToggleArchiveConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: !c.isArchived } : c))
    );
  };

  // Clear All Chats
  const handleClearAllChats = () => {
    setConversations([]);
    setCurrentConversationId(null);
    setInput('');
    setAttachments([]);
  };

  // Stop Generation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);

    // Turn off thinking state on current assistant message if any
    setConversations((prev) => {
      if (!currentConversationId) return prev;
      return prev.map((c) => {
        if (c.id !== currentConversationId) return c;
        const lastMsg = c.messages[c.messages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          return {
            ...c,
            messages: c.messages.map((m, idx) =>
              idx === c.messages.length - 1 ? { ...m, isThinking: false } : m
            ),
          };
        }
        return c;
      });
    });
  };

  // Core Send Message Logic with Progressive Streaming
  const executeGeneration = async (
    conversationToUse: Conversation,
    updatedMessages: Message[]
  ) => {
    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Create placeholder assistant message
    const assistantMessageId = `msg-${Date.now()}`;
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isThinking: thinkMode || webSearch,
      thinkingText: thinkMode
        ? 'Reasoning through problem step by step...'
        : webSearch
        ? 'Searching the web for verified sources...'
        : 'Thinking...',
      thinkModeUsed: thinkMode,
      modelUsed: currentModel,
    };

    const messagesWithAssistant = [...updatedMessages, initialAssistantMessage];

    // Update conversation in state
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationToUse.id
          ? {
              ...c,
              messages: messagesWithAssistant,
              updatedAt: Date.now(),
            }
          : c
      )
    );

    // Format memories into context string
    let memoryContext = '';
    if (settings.memoryEnabled && memories.length > 0) {
      memoryContext = `\nKnown user facts:\n${memories
        .map((m) => `- ${m.content}`)
        .join('\n')}`;
    }

    const combinedSystemPrompt = [
      activeAssistant.systemPrompt,
      settings.customInstructions,
      memoryContext,
    ]
      .filter(Boolean)
      .join('\n\n');

    let accumulatedContent = '';

    await ApiService.streamChat({
      messages: updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments,
      })),
      model: currentModel,
      thinkMode,
      webSearch,
      systemInstruction: combinedSystemPrompt,
      responseStyle: settings.responseStyle,
      assistantName: activeAssistant.name,
      projectInstructions: activeProject?.instructions,
      signal: controller.signal,
      onChunk: (textChunk) => {
        accumulatedContent += textChunk;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== conversationToUse.id) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content: accumulatedContent,
                      isThinking: false,
                    }
                  : m
              ),
            };
          })
        );
      },
      onStatus: (status) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== conversationToUse.id) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, isThinking: true, thinkingText: status }
                  : m
              ),
            };
          })
        );
      },
      onGrounding: (sources) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== conversationToUse.id) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId ? { ...m, sources } : m
              ),
            };
          })
        );
      },
      onError: (errorMessage) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== conversationToUse.id) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      error: errorMessage,
                      isThinking: false,
                    }
                  : m
              ),
            };
          })
        );
      },
      onDone: () => {
        setIsGenerating(false);
        abortControllerRef.current = null;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== conversationToUse.id) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, isThinking: false }
                  : m
              ),
            };
          })
        );
      },
    });
  };

  // User submits message from Composer
  const handleSendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || isGenerating) return;

    const userText = input.trim();
    const currentAttachments = [...attachments];

    // Clear composer inputs immediately
    setInput('');
    setAttachments([]);

    const newUserMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    let targetConv = currentConversation;

    // Create new conversation if needed
    if (!targetConv) {
      const generatedTitle =
        userText.slice(0, 36) + (userText.length > 36 ? '...' : '') ||
        (currentAttachments[0]?.name ? `File: ${currentAttachments[0].name}` : 'New Chat');

      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        title: generatedTitle,
        messages: [newUserMessage],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        projectId: activeProjectId,
        assistantId: activeAssistantId,
      };

      setConversations((prev) => [newConv, ...prev]);
      setCurrentConversationId(newConv.id);
      targetConv = newConv;

      await executeGeneration(newConv, [newUserMessage]);
    } else {
      const updatedMessages = [...targetConv.messages, newUserMessage];
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConv!.id
            ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
            : c
        )
      );
      await executeGeneration(targetConv, updatedMessages);
    }
  };

  // Regenerate Response
  const handleRegenerate = async () => {
    if (!currentConversation || isGenerating) return;

    // Remove last assistant message
    const messages = currentConversation.messages;
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const updatedMessages =
      lastMessage.role === 'assistant' ? messages.slice(0, -1) : messages;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversation.id
          ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
          : c
      )
    );

    await executeGeneration(currentConversation, updatedMessages);
  };

  // Edit Message and Resubmit from that point
  const handleEditMessage = async (index: number, newContent: string) => {
    if (!currentConversation || isGenerating) return;

    // Truncate messages up to the edited user message
    const messagesUpToEdit = currentConversation.messages.slice(0, index + 1);
    messagesUpToEdit[index] = {
      ...messagesUpToEdit[index],
      content: newContent,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversation.id
          ? { ...c, messages: messagesUpToEdit, updatedAt: Date.now() }
          : c
      )
    );

    await executeGeneration(currentConversation, messagesUpToEdit);
  };

  // Send Suggested Starter Prompt
  const handleSendSuggestedPrompt = (promptText: string) => {
    setInput(promptText);
    setTimeout(() => {
      // Auto-trigger send
      const newUserMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: promptText,
        timestamp: Date.now(),
      };

      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        title: promptText.slice(0, 36) + '...',
        messages: [newUserMessage],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        projectId: activeProjectId,
        assistantId: activeAssistantId,
      };

      setConversations((prev) => [newConv, ...prev]);
      setCurrentConversationId(newConv.id);
      setInput('');
      executeGeneration(newConv, [newUserMessage]);
    }, 50);
  };

  return (
    <div className="flex h-screen w-screen bg-[#000000] text-[#FFFFFF] overflow-hidden">
      {/* Offline Notice Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#171717] border-b border-[#333333] text-[#FFFFFF] text-xs py-1.5 px-4 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 text-[#A3A3A3]" />
          <span>You are currently offline. Changes will save locally.</span>
        </div>
      )}

      {/* Chat History Drawer */}
      <HistoryDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onTogglePinConversation={handleTogglePinConversation}
        onToggleArchiveConversation={handleToggleArchiveConversation}
        onOpenProjects={() => setProjectsOpen(true)}
        onOpenAssistants={() => setAssistantsOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenPro={() => setProOpen(true)}
        isPro={settings.isPro}
        activeProject={activeProject}
      />

      {/* Main Conversation Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onNewChat={handleNewChat}
          currentModel={currentModel}
          onSelectModel={setCurrentModel}
          thinkMode={thinkMode}
          setThinkMode={setThinkMode}
          activeProject={activeProject}
          activeAssistant={activeAssistant}
          onOpenProjects={() => setProjectsOpen(true)}
          onOpenAssistants={() => setAssistantsOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenPro={() => setProOpen(true)}
          isPro={settings.isPro}
        />

        {/* Conversation View Area */}
        <ChatView
          messages={currentConversation ? currentConversation.messages : []}
          isGenerating={isGenerating}
          onSendSuggestedPrompt={handleSendSuggestedPrompt}
          onRegenerate={handleRegenerate}
          onEditMessage={handleEditMessage}
          onOpenImage={(att) => setActiveImageForViewer(att)}
          onOpenShare={() => setShareOpen(true)}
          speechVoice={settings.speechVoice}
          assistant={activeAssistant}
        />

        {/* Message Composer Area */}
        <Composer
          input={input}
          setInput={setInput}
          onSend={handleSendMessage}
          onStop={handleStop}
          isGenerating={isGenerating}
          thinkMode={thinkMode}
          setThinkMode={setThinkMode}
          webSearch={webSearch}
          setWebSearch={setWebSearch}
          attachments={attachments}
          onAddAttachment={(att) => setAttachments((prev) => [...prev, att])}
          onRemoveAttachment={(id) =>
            setAttachments((prev) => prev.filter((a) => a.id !== id))
          }
          onOpenImage={(att) => setActiveImageForViewer(att)}
          onOpenCamera={() => setCameraOpen(true)}
          onOpenTools={() => setToolsOpen(true)}
        />
      </div>

      {/* Modals & Overlays */}
      <ImageViewerModal
        image={activeImageForViewer}
        onClose={() => setActiveImageForViewer(null)}
      />

      <CameraModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(att) => setAttachments((prev) => [...prev, att])}
      />

      <ToolsModal
        isOpen={toolsOpen}
        onClose={() => setToolsOpen(false)}
        webSearch={webSearch}
        setWebSearch={setWebSearch}
        thinkMode={thinkMode}
        setThinkMode={setThinkMode}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) =>
          setSettings((prev) => ({ ...prev, ...newSettings }))
        }
        memories={memories}
        onAddMemory={(content) =>
          setMemories((prev) => [
            ...prev,
            { id: `mem-${Date.now()}`, content, createdAt: Date.now() },
          ])
        }
        onDeleteMemory={(id) =>
          setMemories((prev) => prev.filter((m) => m.id !== id))
        }
        onClearMemories={() => setMemories([])}
        onClearAllChats={handleClearAllChats}
        onOpenPro={() => {
          setSettingsOpen(false);
          setProOpen(true);
        }}
      />

      <ProModal
        isOpen={proOpen}
        onClose={() => setProOpen(false)}
        isPro={settings.isPro}
        onUpgradeSuccess={() =>
          setSettings((prev) => ({ ...prev, isPro: true }))
        }
      />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        conversation={currentConversation}
      />

      <ProjectsModal
        isOpen={projectsOpen}
        onClose={() => setProjectsOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => setActiveProjectId(id)}
        onCreateProject={(proj) => setProjects((prev) => [...prev, proj])}
        onDeleteProject={(id) => {
          setProjects((prev) => prev.filter((p) => p.id !== id));
          if (activeProjectId === id) setActiveProjectId(undefined);
        }}
        onUpdateProject={(id, updates) =>
          setProjects((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
          )
        }
      />

      <AssistantsModal
        isOpen={assistantsOpen}
        onClose={() => setAssistantsOpen(false)}
        assistants={assistants}
        activeAssistantId={activeAssistantId}
        onSelectAssistant={(ast) => setActiveAssistantId(ast.id)}
        onCreateAssistant={(ast) => setAssistants((prev) => [...prev, ast])}
      />
    </div>
  );
}
