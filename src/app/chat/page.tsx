// src/app/chat/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import ChatWindow from "../../components/ChatWindow";
import MessageInput from "../../components/MessageInput";
import { Contact, Message } from "../../types/index";
import { socket } from "../../lib/socket";

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const selectedContactRef = useRef<Contact | null>(null);
  const currentUserRef = useRef<any>(null);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    if (!token || !user.id) {
      router.push("/login");
      return;
    }

    setCurrentUser(user);
    socket.connect();
    socket.emit("join", user.id);

    const handleReceiveMessage = (newMessage: Message) => {
      const selected = selectedContactRef.current;
      const current = currentUserRef.current;
      if (!selected || !current) return;

      const belongsToChat =
        (newMessage.sender_id === selected.id && newMessage.receiver_id === current.id) ||
        (newMessage.sender_id === current.id && newMessage.receiver_id === selected.id);

      if (belongsToChat) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.disconnect();
    };
  }, [router]);

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedContact || !currentUser) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/messages/${selectedContact.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to load chat history:", error);
        setMessages([]);
      }
    };

    fetchHistory();
  }, [selectedContact, currentUser]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !selectedContact || !currentUser) return;

    const messageData: Message = {
      sender_id: currentUser.id,
      receiver_id: selectedContact.id,
      message_text: text,
      created_at: new Date().toISOString(),
    };

    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#dadbd3] font-sans">
      <div className="flex h-full w-full max-w-[1600px] shadow-2xl overflow-hidden bg-[#f0f2f5]">
        <Sidebar onSelectContact={(c) => setSelectedContact(c)} />

        <div className="flex-1 flex flex-col bg-[#efeae2] relative">
          {selectedContact ? (
            <>
              <ChatWindow
  contact={selectedContact}
  messages={messages}
  currentUserId={currentUser.id}
/>
              <MessageInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border-b-[6px] border-[#10B981]">
              <div className="w-64 h-64 bg-gray-200 rounded-full mb-8 flex items-center justify-center text-7xl opacity-20 text-black">
                📱
              </div>
              <h2 className="text-3xl font-light text-[#41525d] font-heading">Chat-Web</h2>
              <p className="text-[#667781] mt-4 text-sm max-w-md text-center">
                Send and receive messages without keeping your phone online.
                <br />
                Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
              </p>
              <div className="absolute bottom-10 flex items-center gap-2 text-gray-400 text-xs">
                <span>🔒 End-to-end encrypted</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}