"use client";
import React from "react";
import { Message } from "../types/index";

interface ChatBubbleProps {
  message: Message;
  isOwnMessage: boolean; // true if this message was sent by current user
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwnMessage }) => {
  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`max-w-[70%] p-3 rounded-lg break-words ${
          isOwnMessage
            ? "bg-[#DCF8C6] text-black rounded-br-none" // right bubble style
            : "bg-white text-black rounded-bl-none"    // left bubble style
        }`}
      >
        <p className="text-sm">{message.message_text}</p>
        <span className="text-[10px] text-gray-500 float-right mt-1">
          {message.created_at
            ? new Date(message.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;