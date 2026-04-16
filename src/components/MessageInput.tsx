"use client";

import React, { useState, useRef } from "react";
import { Smile, Plus, Mic, Send } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import VoiceRecorder from "./VoiceRecorder";

export default function MessageInput({ onSendMessage }: any) {
  const [msg, setMsg] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioPreview, setAudioPreview] = useState<{
    url: string;
    blob: Blob;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const send = () => {
    if (!msg.trim()) return;

    onSendMessage({
      message_text: msg,
    });

    setMsg("");
  };

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

  const handleEmoji = (emojiData: any) => {
    setMsg((prev) => prev + emojiData.emoji);
  };

  const handleAudioRecorded = async (audioUrl: string, audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "voice_message.wav");

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      onSendMessage({
        audio_url: data.file_url,
        message_text: "🎙️ Voice message",
      });

      setAudioPreview(null);
      setIsRecording(false);
    } catch (err) {
      console.error("Audio upload failed:", err);
    }
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setAudioPreview(null);
  };

  if (isRecording) {
    return (
      <div className="p-2 sm:p-3 bg-white border-t">
        <VoiceRecorder
          onAudioRecorded={handleAudioRecorded}
          onCancel={handleCancelRecording}
        />
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-3 flex items-center gap-2 sm:gap-3 bg-white relative border-t">

      {/* EMOJI */}
      <Smile
        size={20}
        className="cursor-pointer flex-shrink-0 text-gray-600 hover:text-gray-900"
        onClick={() => setShowEmoji(!showEmoji)}
      />

      {showEmoji && (
        <div className="absolute bottom-14 left-2 z-50">
          <EmojiPicker onEmojiClick={handleEmoji} />
        </div>
      )}

      {/* FILE UPLOAD */}
      <Plus
        size={20}
        className="cursor-pointer flex-shrink-0 text-gray-600 hover:text-gray-900"
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
        className="flex-1 border p-2 rounded text-sm"
        placeholder="Type message..."
        onKeyDown={(e) => e.key === "Enter" && send()}
      />

      {/* SEND / MIC */}
      {msg ? (
        <Send
          size={20}
          className="cursor-pointer text-green-600 flex-shrink-0 hover:text-green-700"
          onClick={send}
        />
      ) : (
        /* Wrapped in a span to fix the 'title' prop error and maintain tooltips */
        <span 
          title="Record voice message" 
          className="flex items-center justify-center cursor-pointer"
          onClick={() => setIsRecording(true)}
        >
          <Mic
            size={20}
            className="text-gray-600 hover:text-green-600 flex-shrink-0 transition"
          />
        </span>
      )}
    </div>
  );
}