export interface Message {
  id?: number;
  sender_id: number;
  receiver_id: number;

  message_text?: string;
   file_type?: string; 

  file_url?: string | null;
  audio_url?: string | null;

  created_at?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Contact {
  id: number;
  name: string;
  lastMsg: string;
  time: string;
  online: boolean;
}