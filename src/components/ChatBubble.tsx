"use client";
import React, { useState, useRef } from "react";
import { Message } from "../types";
import DeleteModal from "./DeleteModal";
import { api } from "../lib/api";
import { socket } from "../lib/socket";
import { Play, Pause, Download, FileText, Loader2, Trash2 } from "lucide-react";

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
  const [tapCount, setTapCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);

  const handleDelete = async (type: "me" | "everyone") => {
    try {
      setIsLoading(true);

      // Send delete request via API (primary method)
      const response = await api.put(`/messages/delete/${message.id}`, {
        userId: currentUserId,
        type,
      });

      if (response.status === 200) {
        // Also emit socket event for real-time update to other users
        socket.emit("delete_message", {
          messageId: message.id,
          userId: currentUserId,
          type,
          sender_id: message.sender_id,
          receiver_id: message.receiver_id,
        });

        setShowModal(false);
        refreshMessages();
      } else {
        alert("Failed to delete message. Please try again.");
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      const errorMsg = err?.response?.data?.error || "Failed to delete message";
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const isImage = 
    message.file_type?.startsWith("image/") || 
    (message.file_url ? /\.(jpg|jpeg|png|gif|webp)$/i.test(message.file_url) : false) || 
    message.file_url?.startsWith("blob:");

  const isAudio = !!(message.audio_url && message.message_text?.includes("Voice message"));

  // 🗑️ CHECK IF MESSAGE IS DELETED FOR CURRENT USER
  const isDeletedForMe = isOwnMessage
    ? message.deleted_for_sender
    : message.deleted_for_receiver;

  const isDeletedForEveryone = message.deleted_for_everyone;

  // If deleted for everyone OR deleted for me, show deletion notice
  const showDeletedMessage = isDeletedForEveryone || isDeletedForMe;

  // 🗑️ CHECK IF MESSAGE IS DELETABLE (Within 2 hours - like WhatsApp)
  const isMessageDeletable = () => {
    if (!message.created_at) return false;
    const messageTime = new Date(message.created_at).getTime();
    const now = new Date().getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    return now - messageTime < twoHoursInMs;
  };

  const isLocalMessage = message.sender_id <= 0 || message.receiver_id < 0;
  const canDeleteMessage = !isLocalMessage && isMessageDeletable() && !showDeletedMessage;

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

  // 📱 HANDLE DOUBLE TAP FOR MOBILE (SKIP FOR AUDIO MESSAGES)
  const handleTap = () => {
    if (showDeletedMessage || !canDeleteMessage || isAudio) return;

    const now = Date.now();
    const timeDiff = now - lastTapRef.current;

    if (timeDiff < 300 && timeDiff > 0) {
      // Double tap detected
      setShowModal(true);
      lastTapRef.current = 0;
    } else {
      // First tap
      lastTapRef.current = now;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4 px-4`}>
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] p-3 shadow-sm transition-all duration-200 ${
          showDeletedMessage
            ? "bg-gray-200 text-gray-500 italic rounded-lg cursor-default"
            : `${isAudio ? "cursor-default" : "cursor-pointer hover:shadow-md active:scale-95"} touch-manipulation ${
              isOwnMessage
                ? "bg-[#dcf8c6] text-black rounded-t-xl rounded-bl-xl rounded-br-sm"
                : "bg-[#e5e5ea] text-black rounded-t-xl rounded-br-xl rounded-bl-sm"
            }`
        }`}
        onDoubleClick={() => {
          if (!showDeletedMessage && canDeleteMessage && !isAudio) {
            setShowModal(true);
          }
        }}
        onClick={(e) => {
          if (!isAudio) {
            handleTap();
          }
        }}
      >
        {/* DELETE ICON FOR OWN MESSAGES */}
        {!showDeletedMessage && isOwnMessage && canDeleteMessage && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/90 text-red-600 hover:bg-red-100 z-10"
            aria-label="Delete message"
          >
            <Trash2 size={16} />
          </button>
        )}

        {/* 🗑️ DELETED MESSAGE */}
        {showDeletedMessage && (
          <div className="flex items-center gap-2">
            <Trash2 size={16} className="flex-shrink-0" />
            <p className="text-sm">This message was deleted</p>
          </div>
        )}

        {/* 💬 TEXT */}
        {!showDeletedMessage && message.message_text && !isAudio && (
          <p className="font-sans break-words leading-relaxed">{message.message_text}</p>
        )}

        {/* 🎙️ AUDIO MESSAGE */}
        {!showDeletedMessage && isAudio && message.audio_url && (
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
              crossOrigin="anonymous"
              className="hidden"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleAudioPlayback();
              }}
              onDoubleClick={(e) => e.stopPropagation()}
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
        {!showDeletedMessage && message.file_url && !isAudio && (
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
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default ChatBubble;