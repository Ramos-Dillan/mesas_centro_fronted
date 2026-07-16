import { TableItem } from './table.model';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  generated_image?: string | null;
  table?: TableItem | null;
}

export interface ChatResponse {
  conversation_id: number;
  reply: string;
  generated_image: string | null;
  table_id: number | null;
}