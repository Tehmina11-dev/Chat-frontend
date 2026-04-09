// components/messageinput.tsx
"use client";
import React, { useState } from "react";
import { Smile, Plus, Mic, Send } from "lucide-react";

interface Props {
  onSendMessage: (msg: string) => void;
}

const MessageInput: React.FC<Props> = ({ onSendMessage }) => {
  const [msg, setMsg] = useState("");

  const handleSend = () => {
    if (!msg.trim()) return;
    onSendMessage(msg);
    setMsg(""); // Clear input after sending
  };

  return (
    <div className="p-2 bg-[#f0f2f5] flex items-center gap-4">
      <div className="flex gap-4 text-[#54656f] ml-2">
        <Smile size={24} className="cursor-pointer" />
        <Plus size={24} className="cursor-pointer" />
      </div>

      <input
        type="text"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Type a message"
        className="flex-1 py-2 px-4 rounded-lg bg-white outline-none text-sm text-black"
      />

      <div className="mr-2 text-[#54656f]">
        {msg ? (
          <Send size={24} className="cursor-pointer text-[#00a884]" onClick={handleSend} />
        ) : (
          <Mic size={24} className="cursor-pointer" />
        )}
      </div>
    </div>
  );
};

export default MessageInput;