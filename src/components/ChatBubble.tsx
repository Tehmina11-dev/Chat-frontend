"use client";
import React, { useState, useRef } from "react";
import { Message } from "../types";
import DeleteModal from "./DeleteModal";
import { api } from "../lib/api";
import { Play, Pause, Download, FileText, Loader2 } from "lucide-react";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleDelete = async (type: "me" | "everyone") => {
    try {
      await api.put(`/messages/delete/${message.id}`, {
        userId: currentUserId,
        type,
      });
      setShowModal(false);
      refreshMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const isImage = 
    message.file_type?.startsWith("image/") || 
    (message.file_url ? /\.(jpg|jpeg|png|gif|webp)$/i.test(message.file_url) : false) || 
    message.file_url?.startsWith("blob:");

  const isAudio = !!(message.audio_url && message.message_text?.includes("Voice message"));

  const toggleAudioPlayback = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Ensure audio is loaded before playing
        if (audioRef.current.readyState === 0) {
          await audioRef.current.load();
        }
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsPlaying(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // FORMAT TIME HELPER
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4 px-4`}>
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] p-3 shadow-sm transition-all duration-200 cursor-pointer ${
          isOwnMessage
            ? "bg-[#dcf8c6] text-black rounded-t-xl rounded-bl-xl rounded-br-sm"
            : "bg-[#e5e5ea] text-black rounded-t-xl rounded-br-xl rounded-bl-sm"
        }`}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowModal(true);
        }}
      >
        {/* 💬 TEXT */}
        {message.message_text && !isAudio && (
          <p className="font-sans break-words leading-relaxed">{message.message_text}</p>
        )}

        {/* 🎙️ AUDIO MESSAGE */}
        {isAudio && message.audio_url && (
          <div className="flex items-center gap-3 bg-white/50 p-3 rounded-lg max-w-xs">
            <audio
              ref={audioRef}
              src={message.audio_url}
              onEnded={handleAudioEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedMetadata={() => setAudioDuration(audioRef.current?.duration || 0)}
              onLoadStart={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
              className="hidden"
            />
            <button
              onClick={toggleAudioPlayback}
              disabled={isLoading}
              className={`p-2 rounded-full transition flex-shrink-0 ${
                isLoading
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : isPlaying
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
              title={isLoading ? "Loading..." : isPlaying ? "Pause" : "Play"}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isPlaying ? (
                <Pause size={16} className="fill-current" />
              ) : (
                <Play size={16} className="fill-current" />
              )}
            </button>

            {/* WAVEFORM VISUALIZATION */}
            <div className="flex-1 flex items-center gap-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-gray-400 rounded-full transition-all duration-200 ${
                    isPlaying ? "bg-green-500 animate-pulse" : ""
                  }`}
                  style={{
                    height: `${Math.random() * 20 + 5}px`,
                    animationDelay: isPlaying ? `${i * 0.1}s` : "0s",
                    animationDuration: isPlaying ? "0.5s" : "0s",
                  }}
                />
              ))}
            </div>

            {/* DURATION */}
            <span className="text-xs text-gray-600 font-medium">
              {formatTime(audioDuration)}
            </span>
          </div>
        )}

        {/* 📎 FILE / IMAGE */}
        {message.file_url && !isAudio && (
          <div className={message.message_text ? "mt-3" : ""}>
            {isImage ? (
              <div className="rounded-xl overflow-hidden border-2 border-white/50 shadow-sm">
                <img
                  src={message.file_url}
                  className="max-w-full h-auto block"
                  alt="attachment"
                />
              </div>
            ) : (
              <a
                href={message.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 bg-white/30 p-3 rounded-xl border border-white/40 hover:bg-white/50 transition group"
              >
                <div className="bg-primary p-2 rounded-lg">
                    <FileText size={20} />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold truncate">Download File</span>
                    <span className="text-[10px] opacity-60 truncate">{message.message_text || "Attachment"}</span>
                </div>
              </a>
            )}
          </div>
        )}

        {/* 🕒 TIME & STATUS */}
        {message.created_at && (
          <div className={`text-[10px] mt-2 flex items-center justify-end font-medium ${isOwnMessage ? "text-gray-600" : "text-gray-500"}`}>
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