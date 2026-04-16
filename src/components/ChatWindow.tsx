"use client";

import React from "react";
import { Contact, Message } from "../types/index";
import ChatBubble from "./ChatBubble";

interface ChatWindowProps {
  contact: Contact;
  messages: Message[];
  currentUserId: number;
  refreshMessages: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  contact,
  messages,
  currentUserId,
  refreshMessages,
}) => {
  return (
    <div className="flex-1 p-2 sm:p-4 overflow-y-auto flex flex-col bg-[#efeae2]">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold truncate">
          {contact.name}
        </h2>

        <button
          onClick={refreshMessages}
          className="text-xs sm:text-sm bg-white px-2 sm:px-3 py-1 rounded shadow hover:bg-gray-100 whitespace-nowrap ml-2"
        >
          Refresh
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex flex-col gap-1 sm:gap-2">
        {messages?.length > 0 ? (
          messages.map((msg, idx) => (
            <ChatBubble
              key={idx}
              message={msg}
              isOwnMessage={msg.sender_id === currentUserId}
              currentUserId={currentUserId}
              refreshMessages={refreshMessages}
            />
          ))
        ) : (
          <div className="text-center text-gray-400 mt-10 text-sm">
            No messages yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;