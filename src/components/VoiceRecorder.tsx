"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, X } from "lucide-react";

interface Props {
  onAudioRecorded: (audioUrl: string, audioBlob: Blob) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onAudioRecorded, onCancel }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.onstart = () => {
          setIsRecording(true);
          setRecordingTime(0);
          timerRef.current = setInterval(() => {
            setRecordingTime((prev) => prev + 1);
          }, 1000);
        };

        mediaRecorder.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsRecording(false);

          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          onAudioRecorded(audioUrl, audioBlob);

          // Stop all audio tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      } catch (err) {
        console.error("Microphone access denied:", err);
        onCancel();
      }
    };

    startRecording();

    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };
  }, [onAudioRecorded, onCancel]);

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleCancel = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
    }
    audioChunksRef.current = [];
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-[#f0f0f0] border-t border-gray-200">
      {/* CANCEL BUTTON */}
      <button
        onClick={handleCancel}
        className="p-2 hover:bg-gray-200 rounded-full transition"
        title="Cancel recording"
      >
        <X size={20} className="text-gray-600" />
      </button>

      {/* RECORDING INDICATOR */}
      <div className="flex items-center gap-2 flex-1">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-gray-700">
          Recording... {formatTime(recordingTime)}
        </span>
      </div>

      {/* SEND BUTTON */}
      <button
        onClick={handleStopRecording}
        disabled={!isRecording}
        className="p-3 bg-green-500 hover:bg-green-600 rounded-full transition disabled:opacity-50"
        title="Send voice message"
      >
        <Send size={18} className="text-white fill-current" />
      </button>
    </div>
  );
}
