"use client";

import React, { useEffect, useRef } from "react";
import { Contact, Message, GroupMessage } from "../types/index";
import ChatBubble from "./ChatBubble";

interface ChatWindowProps {
  contact: Contact | null;
  messages: Message[] | GroupMessage[];
  currentUserId: number;
  refreshMessages: () => void;
  onDeleteRequest: (message: Message | GroupMessage) => void;
  isGroupChat?: boolean;
  groupName?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  contact,
  messages,
  currentUserId,
  refreshMessages,
  onDeleteRequest,
  isGroupChat = false,
  groupName,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Determine display name
  const displayName = isGroupChat ? (groupName || "Group Chat") : (contact?.name || "Chat");

  return (
    <div className="flex-1 p-2 sm:p-4 overflow-y-auto flex flex-col bg-[#efeae2]">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold truncate">
          {displayName}
        </h2>

        <button
          onClick={refreshMessages}
          className="text-xs sm:text-sm bg-white px-2 sm:px-3 py-1 rounded shadow hover:bg-gray-100 whitespace-nowrap ml-2"
        >
          Refresh
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex flex-col gap-1 sm:gap-2" style={{ scrollBehavior: "smooth" }}>
        {messages?.length > 0 ? (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isOwnMessage={msg.sender_id === currentUserId}
              currentUserId={currentUserId}
              refreshMessages={refreshMessages}
              onDeleteRequest={onDeleteRequest}
              isGroupMessage={isGroupChat}
            />
          ))
        ) : (
          <div className="text-center text-gray-400 mt-10 text-sm">
            No messages yet
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;