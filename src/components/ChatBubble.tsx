"use client";

import React, { useState } from "react";
import { Message } from "../types";
import DeleteModal from "./DeleteModal";
import { api } from "../lib/api";

interface Props {
  message: Message;
  isOwnMessage: boolean;
  currentUserId: number;
  refreshMessages: () => void;
}

const ChatBubble: React.FC<Props> = ({
  message,
  isOwnMessage,
  currentUserId,
  refreshMessages,
}) => {
  const [showModal, setShowModal] = useState(false);

  // 🗑 DELETE MESSAGE
  const handleDelete = async (type: "me" | "everyone") => {
    try {
      await api.put(`/messages/delete/${message.id}`, {
        userId: currentUserId,
        type,
      });

      setShowModal(false);
      refreshMessages();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div
      className={`flex ${
        isOwnMessage ? "justify-end" : "justify-start"
      } mb-2`}
    >
      <div
        className={`relative max-w-[70%] p-3 rounded-lg cursor-pointer ${
          isOwnMessage ? "bg-green-200" : "bg-white"
        }`}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowModal(true);
        }}
      >
        {/* 💬 TEXT */}
        {message.message_text && (
          <p className="text-sm">{message.message_text}</p>
        )}

        {/* 📎 FILE / IMAGE SUPPORT */}
        {message.file_url && (
          <div className="mt-2">
            {message.file_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <img
                src={message.file_url}
                className="max-w-[200px] rounded"
                alt="file"
              />
            ) : (
              <a
                href={message.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline"
              >
                📎 Download File
              </a>
            )}
          </div>
        )}

        {/* 🕒 TIME (optional future use) */}
        {message.created_at && (
          <div className="text-[10px] text-gray-500 mt-1 text-right">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>

      {/* 🗑 DELETE MODAL */}
      {showModal && (
        <DeleteModal
          onClose={() => setShowModal(false)}
          onDeleteForMe={() => handleDelete("me")}
          onDeleteForEveryone={() => handleDelete("everyone")}
        />
      )}
    </div>
  );
};

export default ChatBubble;