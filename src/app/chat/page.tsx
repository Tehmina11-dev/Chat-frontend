"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import ChatWindow from "../../components/ChatWindow";
import MessageInput from "../../components/MessageInput";
import { Contact, Message } from "../../types/index";
import { socket } from "../../lib/socket";
import { api } from "../../lib/api"; // ✅ centralized axios instance

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<Contact | null>(null);

  const selectedContactRef = useRef<Contact | null>(null);
  const currentUserRef = useRef<Contact | null>(null);

  const router = useRouter();

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Load user from localStorage & connect socket
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    if (!token || !user.id) {
      router.push("/login");
      return;
    }

    setCurrentUser({
      id: user.id,
      name: user.username,
      lastMsg: "",
      time: "",
      online: true,
    });

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

  // Fetch chat history when contact changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedContact || !currentUser) return;

      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/messages/${selectedContact.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  if (!currentUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-gray-500">
        Loading user...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen">
      <Sidebar onSelectContact={(c) => setSelectedContact(c)} />

      <div className="flex-1 flex flex-col bg-[#efeae2]">
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
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
}