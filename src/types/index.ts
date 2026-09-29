export type Role = 'user' | 'assistant' | 'system';

export type ResponseStyle = 'concise' | 'balanced' | 'detailed';

export type ModelId = 'gpt-hub-4.5' | 'gpt-hub-reasoning' | 'gpt-hub-fast';

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  mimeType: string;
  size: number;
  base64: string;
  previewUrl?: string;
  textContent?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  sources?: GroundingSource[];
  isThinking?: boolean;
  thinkingText?: string;
  thinkModeUsed?: boolean;
  error?: string;
  modelUsed?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  projectId?: string;
  assistantId?: string;
  isArchived?: boolean;
  isPinned?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  instructions: string;
  createdAt: number;
  color?: string;
}

export interface Assistant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  avatarIcon: string;
  systemPrompt: string;
  tools: {
    webSearch: boolean;
    imageAnalysis: boolean;
    fileAnalysis: boolean;
    dataAnalysis: boolean;
  };
  isDefault?: boolean;
}

export interface UserMemory {
  id: string;
  content: string;
  createdAt: number;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  defaultModel: ModelId;
  thinkModeDefault: boolean;
  webSearchDefault: boolean;
  responseStyle: ResponseStyle;
  customInstructions: string;
  memoryEnabled: boolean;
  speechVoice: string;
  autoScroll: boolean;
  isPro: boolean;
  userName: string;
  userEmail: string;
}
