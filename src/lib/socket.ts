import { io, Socket } from "socket.io-client";
import { Message, GroupMessage } from "../types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export const socket = io(BACKEND_URL, {
  autoConnect: false,
});

// Group chat management
export const groupSocket = {
  // Initialize group chat connection
  initializeGroupChat: (userId: number, groupId: number): void => {
    // Join the group room
    socket.emit("join_group", groupId);
    console.log(`Joined group chat: ${groupId} for user: ${userId}`);
  },

  // Leave group chat
  leaveGroupChat: (groupId: number): void => {
    socket.emit("leave_group", groupId);
    console.log(`Left group chat: ${groupId}`);
  },

  // Send group message
  sendGroupMessage: (data: {
    sender_id: number;
    group_id: number;
    message_text?: string;
    file_url?: string;
    audio_url?: string;
    file_type?: string;
  }): void => {
    socket.emit("send_group_message", data);
  },

  // Listen for group messages
  onGroupMessage: (callback: (message: GroupMessage) => void): void => {
    socket.on("receive_group_message", callback);
  },

  // Listen for group message sent confirmation
  onGroupMessageSent: (callback: (message: GroupMessage) => void): void => {
    socket.on("group_message_sent", callback);
  },

  // Listen for group message errors
  onGroupMessageError: (callback: (error: { error: string }) => void): void => {
    socket.on("group_message_error", callback);
  },

  // Remove group message listeners
  offGroupMessage: (): void => {
    socket.off("receive_group_message");
    socket.off("group_message_sent");
    socket.off("group_message_error");
  },
};

// Private chat functions (existing)
export const privateSocket = {
  // Join private chat
  joinPrivateChat: (userId: number): void => {
    socket.emit("join", userId);
  },

  // Send private message
  sendPrivateMessage: (data: {
    sender_id: number;
    receiver_id: number;
    message_text?: string;
    file_url?: string;
    audio_url?: string;
    file_type?: string;
  }): void => {
    socket.emit("send_message", data);
  },

  // Listen for private messages
  onPrivateMessage: (callback: (message: Message) => void): void => {
    socket.on("receive_message", callback);
  },

  // Listen for message sent confirmation
  onMessageSent: (callback: (message: Message) => void): void => {
    socket.on("message_sent", callback);
  },

  // Remove private message listeners
  offPrivateMessage: (): void => {
    socket.off("receive_message");
    socket.off("message_sent");
  },
};