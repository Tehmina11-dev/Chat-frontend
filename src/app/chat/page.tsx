"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import ChatWindow from "../../components/ChatWindow";
import MessageInput from "../../components/MessageInput";
import { Contact, Message } from "../../types/index";
import { socket } from "../../lib/socket";
import { api } from "../../lib/api";

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<Contact | null>(null);

  const selectedRef = useRef<Contact | null>(null);
  const currentRef = useRef<Contact | null>(null);

  const router = useRouter();

  useEffect(() => {
    selectedRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    currentRef.current = currentUser;
  }, [currentUser]);

  // AUTH + SOCKET
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

    const handleMsg = (msg: Message) => {
      const selected = selectedRef.current;
      const current = currentRef.current;

      if (!selected || !current) return;

      const valid =
        (msg.sender_id === selected.id && msg.receiver_id === current.id) ||
        (msg.sender_id === current.id && msg.receiver_id === selected.id);

      if (valid) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receive_message", handleMsg);

    return () => {
      socket.off("receive_message", handleMsg);
      socket.disconnect();
    };
  }, [router]);

  // REFRESH MESSAGES
  const refreshMessages = async () => {
    if (!selectedContact || !currentUser) return;

    try {
      const token = localStorage.getItem("token");

      const res = await api.get(
        `/messages/history/${currentUser.id}/${selectedContact.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages(res.data);
    } catch (err) {
      console.error("Refresh failed:", err);
      setMessages([]);
    }
  };

  // AUTO LOAD HISTORY
  useEffect(() => {
    refreshMessages();
  }, [selectedContact, currentUser]);

  // 💬 SEND MESSAGE (TEXT + FILE SUPPORT MERGED)
  const handleSendMessage = (payload: any) => {
    if (!selectedContact || !currentUser) return;

    const messageData = {
      sender_id: currentUser.id,
      receiver_id: selectedContact.id,
      message_text: payload.message_text || "",
      file_url: payload.file_url || null,
    };

    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    socket.disconnect();
    router.push("/login");
  };

  if (!currentUser) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen w-screen">

      <Sidebar onSelectContact={setSelectedContact} />

      <div className="flex-1 flex flex-col bg-[#efeae2]">

        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-3 border-b">
          <h2 className="font-semibold">
            {selectedContact ? selectedContact.name : "Chat"}
          </h2>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>

        {selectedContact ? (
          <>
            <ChatWindow
              contact={selectedContact}
              messages={messages}
              currentUserId={currentUser.id}
              refreshMessages={refreshMessages}
            />

            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a user to start chat
          </div>
        )}
      </div>
    </div>
  );
}