"use client";
import React from "react";
import { Contact, Message } from "../types/index";
import ChatBubble from "./ChatBubble";

interface ChatWindowProps {
  contact: Contact;
  messages: Message[];
  currentUserId: number; // Needed to identify own messages
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  contact,
  messages,
  currentUserId,
}) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto flex flex-col bg-[#efeae2]">
      {/* Contact Name Header */}
      <h2 className="text-xl font-semibold mb-4">{contact.name}</h2>

      {/* Messages */}
      <div className="flex flex-col gap-2">
        {messages.map((msg, idx) => (
          <ChatBubble
            key={idx}
            message={msg}
            isOwnMessage={msg.sender_id === currentUserId} // Aligns right if sent by current user
          />
        ))}
      </div>
    </div>
  );
};

export default ChatWindow;