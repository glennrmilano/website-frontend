// Authentication
export interface AuthStore {
  apiKey: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setApiKey: (key: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

// Chat
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  tokensUsed: number;
  createdAt: string;
}

export interface ToolCall {
  name: string;
  input: Record<string, any>;
  status: 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
}

export interface Artifact {
  id: string;
  kind: 'html' | 'markdown' | 'chart_json' | 'table' | 'code';
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

// API Response types
export interface CreateSessionResponse {
  session_id: string;
}

export interface PostMessageResponse {
  stream_id: string;
}

export interface GetMessagesResponse extends Array<Message> {}

export interface GetUsageResponse {
  session_id: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  estimated_total_cost: number;
  records_count: number;
}

// SSE Event types
export interface TokenEvent {
  type: 'token';
  content: string; // normalized server field
  provider?: string;
}

export interface ToolStartEvent {
  type: 'tool_start';
  tool_name: string;
  input?: Record<string, any>;
}

export interface ToolResultEvent {
  type: 'tool_result';
  tool_name: string;
  result: string;
  error?: string;
}

export interface ArtifactCreatedEvent {
  type: 'artifact_created';
  artifact_id: string;
  kind: string;
  title: string;
  content?: string;
}

export interface DoneEvent {
  type: 'done';
  provider: string;
  iterations?: number;
}

export interface ErrorEvent {
  type: 'error';
  code?: string;
  message?: string;
  provider?: string;
}

export type StreamEvent = 
  | TokenEvent 
  | ToolStartEvent 
  | ToolResultEvent 
  | ArtifactCreatedEvent 
  | DoneEvent
  | ErrorEvent;

// Chat state
export interface ChatStore {
  messages: Message[];
  currentSession: string | null;
  isLoading: boolean;
  streamingText: string;
  toolCalls: ToolCall[];
  artifacts: Artifact[];

  addMessage: (msg: Message) => void;
  appendToken: (token: string) => void;
  setSession: (id: string) => void;
  clear: () => void;
  sendMessage: (text: string) => Promise<string>;
  subscribeToStream: (streamId: string) => Promise<void>;
}
