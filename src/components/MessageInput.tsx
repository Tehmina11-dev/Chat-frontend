"use client";

import React, { useState, useRef } from "react";
import { Smile, Plus, Mic, Send } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

export default function MessageInput({ onSendMessage }: any) {
  const [msg, setMsg] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 🟢 SEND TEXT MESSAGE
  const send = () => {
    if (!msg.trim()) return;

    onSendMessage({
      message_text: msg,
    });

    setMsg("");
  };

  // 🟢 FILE UPLOAD (UPDATED - REAL BACKEND)
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      onSendMessage({
        file_url: data.file_url,
        file_type: data.file_type,
        message_text: file.name,
      });
    } catch (err) {
      console.error("Upload failed:", err);
    }

    e.target.value = "";
  };

  // 🟢 EMOJI HANDLER
  const handleEmoji = (emojiData: any) => {
    setMsg((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="p-2 flex items-center gap-3 bg-white relative">

      {/* EMOJI */}
      <Smile
        className="cursor-pointer"
        onClick={() => setShowEmoji(!showEmoji)}
      />

      {showEmoji && (
        <div className="absolute bottom-14 left-2 z-50">
          <EmojiPicker onEmojiClick={handleEmoji} />
        </div>
      )}

      {/* FILE UPLOAD */}
      <Plus
        className="cursor-pointer"
        onClick={() => fileRef.current?.click()}
      />

      <input
        type="file"
        hidden
        ref={fileRef}
        onChange={handleFile}
      />

      {/* TEXT INPUT */}
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        className="flex-1 border p-2 rounded"
        placeholder="Type message..."
      />

      {/* SEND / MIC */}
      {msg ? (
        <Send
          className="cursor-pointer text-green-600"
          onClick={send}
        />
      ) : (
        <Mic className="text-gray-500" />
      )}
    </div>
  );
}