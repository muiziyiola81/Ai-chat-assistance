import {
  Conversation,
  Project,
  Assistant,
  UserMemory,
  UserSettings,
} from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'gpthub_conversations_v1',
  CURRENT_CONV_ID: 'gpthub_current_conv_id_v1',
  PROJECTS: 'gpthub_projects_v1',
  ASSISTANTS: 'gpthub_assistants_v1',
  MEMORIES: 'gpthub_memories_v1',
  SETTINGS: 'gpthub_settings_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  defaultModel: 'gpt-hub-4.5',
  thinkModeDefault: false,
  webSearchDefault: false,
  responseStyle: 'balanced',
  customInstructions: '',
  memoryEnabled: true,
  speechVoice: 'Kore',
  autoScroll: true,
  isPro: false,
  userName: 'GPT Hub Member',
  userEmail: 'member@gpthub.ai',
};

export const DEFAULT_ASSISTANTS: Assistant[] = [
  {
    id: 'default',
    name: 'GPT Hub Core',
    tagline: 'General intelligence & reasoning',
    description: 'The standard versatile GPT Hub model for high-speed dialogue, writing, and problem solving.',
    avatarIcon: 'Sparkles',
    systemPrompt: 'You are GPT Hub Core, a powerful, versatile and balanced AI assistant.',
    tools: {
      webSearch: true,
      imageAnalysis: true,
      fileAnalysis: true,
      dataAnalysis: true,
    },
    isDefault: true,
  },
  {
    id: 'code-architect',
    name: 'Code Architect',
    tagline: 'Full-stack software engineering',
    description: 'Expert programming assistant focused on clean architectures, debugging, refactoring, and modern web standards.',
    avatarIcon: 'Code2',
    systemPrompt: 'You are Code Architect, an elite senior software engineer. Provide clean, production-ready code with complete types and architecture best practices.',
    tools: {
      webSearch: true,
      imageAnalysis: true,
      fileAnalysis: true,
      dataAnalysis: true,
    },
  },
  {
    id: 'research-analyst',
    name: 'Deep Analyst',
    tagline: 'Research, synthesis & citation',
    description: 'Excels at comprehensive market research, academic literature synthesis, and factual verification.',
    avatarIcon: 'Search',
    systemPrompt: 'You are Deep Analyst, a rigorous research specialist. Focus on citations, structured synthesis, counterarguments, and factual integrity.',
    tools: {
      webSearch: true,
      imageAnalysis: true,
      fileAnalysis: true,
      dataAnalysis: true,
    },
  },
  {
    id: 'data-scientist',
    name: 'Data Insights',
    tagline: 'CSV, spreadsheet & statistical analysis',
    description: 'Specializes in analyzing CSV tables, datasets, math computations, and generating structured summaries.',
    avatarIcon: 'BarChart3',
    systemPrompt: 'You are Data Insights, a data scientist assistant. Provide tabular representations, summary statistics, actionable insights, and structured data reviews.',
    tools: {
      webSearch: true,
      imageAnalysis: true,
      fileAnalysis: true,
      dataAnalysis: true,
    },
  },
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'project-default',
    name: 'Personal Workspace',
    description: 'General inquiries, creative thoughts, and exploration.',
    instructions: 'Be conversational, helpful, and maintain a friendly yet professional tone.',
    createdAt: Date.now() - 86400000 * 3,
    color: '#FFFFFF',
  },
];

export const StorageService = {
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to parse settings from storage:', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse conversations:', e);
    }
    return [];
  },

  saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations:', e);
    }
  },

  getCurrentConversationId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_CONV_ID);
    } catch {
      return null;
    }
  },

  setCurrentConversationId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_CONV_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_CONV_ID);
      }
    } catch (e) {
      console.error('Failed to set current conversation id:', e);
    }
  },

  getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse projects:', e);
    }
    return DEFAULT_PROJECTS;
  },

  saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects:', e);
    }
  },

  getAssistants(): Assistant[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSISTANTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse assistants:', e);
    }
    return DEFAULT_ASSISTANTS;
  },

  saveAssistants(assistants: Assistant[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSISTANTS, JSON.stringify(assistants));
    } catch (e) {
      console.error('Failed to save assistants:', e);
    }
  },

  getMemories(): UserMemory[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse memories:', e);
    }
    return [
      {
        id: 'mem-1',
        content: 'Prefers concise code solutions in TypeScript with Tailwind CSS.',
        createdAt: Date.now() - 86400000 * 2,
      },
      {
        id: 'mem-2',
        content: 'Values clean monochrome interfaces with subtle light-black depth.',
        createdAt: Date.now() - 86400000 * 1,
      },
    ];
  },

  saveMemories(memories: UserMemory[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    } catch (e) {
      console.error('Failed to save memories:', e);
    }
  },
};
