export interface Message {
  id?: number;
  sender_id: number;
  receiver_id: number;

  message_text?: string;
   file_type?: string;

  file_url?: string | null;
  audio_url?: string | null;

  created_at?: string;

  // Delete flags
  deleted_for_everyone?: boolean;
  deleted_for_sender?: boolean;
  deleted_for_receiver?: boolean;
}

export interface GroupMessage {
  id?: number;
  sender_id: number;
  group_id: number;
  message_text?: string;
  file_type?: string;
  file_url?: string | null;
  audio_url?: string | null;
  created_at?: string;
  sender_name?: string; // Updated from sender_email to sender_name
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Group {
  id?: number;
  name: string;
  created_by: number;
  created_at?: string;
  joined_at?: string;
}

export interface Contact {
  id: number;
  name: string;
  lastMsg: string;
  time: string;
  online: boolean;
  isAI?: boolean;
}