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

  // 🟢 FILE HANDLER (FIXED + MERGED)
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onSendMessage({
      file_url: URL.createObjectURL(file),
      message_text: file.name, // optional filename
    });

    // reset input so same file can be selected again
    e.target.value = "";
  };

  // 🟢 EMOJI HANDLER
  const handleEmoji = (emojiData: any) => {
    setMsg((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="p-2 flex items-center gap-3 bg-white relative">

      {/* EMOJI BUTTON */}
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