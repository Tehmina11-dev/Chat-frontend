"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import ChatWindow from "../../components/ChatWindow";
import MessageInput from "../../components/MessageInput";
import CreateGroupModal from "../../components/CreateGroupModal";
import { Menu, Users } from "lucide-react";
import { Contact, Message, Group, User } from "../../types/index";
import { socket, privateSocket, groupSocket } from "../../lib/socket";
import { api, groupsApi } from "../../lib/api";
import { useGroupChat } from "../../hooks/useGroupChat";

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<Contact | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [isGroupChat, setIsGroupChat] = useState(false);

  const AI_CONTACT: Contact = {
    id: -9999,
    name: "AI Assistant",
    lastMsg: "Ask the AI anything",
    time: "",
    online: true,
    isAI: true,
  };

  const selectedRef = useRef<Contact | null>(null);
  const currentRef = useRef<Contact | null>(null);

  const router = useRouter();

  // Group chat hook
  const {
    groups,
    activeGroupId,
    groupMessages,
    initializeGroupChat,
    sendGroupMessage,
    createGroup,
    fetchUserGroups,
  } = useGroupChat(currentUser?.id || 0);

//   const AI_CONTACT: Contact = {
//     id: -9999,
//     name: "AI Assistant",
//     lastMsg: "Ask the AI anything",
//     time: "",
//     online: true,
//     isAI: true,
//   };

//   const selectedRef = useRef<Contact | null>(null);
//   const currentRef = useRef<Contact | null>(null);

//   const router = useRouter();

  useEffect(() => {
    selectedRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    currentRef.current = currentUser;
  }, [currentUser]);

  // 🔐 AUTH + SOCKET
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
    privateSocket.joinPrivateChat(user.id);

    // Fetch users for group creation
    const fetchUsers = async () => {
      try {
        const res = await api.get("/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.filter((u: User) => u.id !== user.id));
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();

    const handlePrivateMsg = (msg: Message) => {
      const selected = selectedRef.current;
      const current = currentRef.current;

      if (!selected || !current || isGroupChat) return;

      const valid =
        (msg.sender_id === selected.id && msg.receiver_id === current.id) ||
        (msg.sender_id === current.id && msg.receiver_id === selected.id);

      if (valid) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    // 🗑️ HANDLE MESSAGE DELETION
    const handleMessageDeleted = (deletedMsg: Message) => {
      const selected = selectedRef.current;
      const current = currentRef.current;

      if (!selected || !current || isGroupChat) return;

      const valid =
        (deletedMsg.sender_id === selected.id && deletedMsg.receiver_id === current.id) ||
        (deletedMsg.sender_id === current.id && deletedMsg.receiver_id === selected.id);

      if (valid) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === deletedMsg.id ? { ...msg, ...deletedMsg } : msg
          )
        );
      }
    };

    privateSocket.onPrivateMessage(handlePrivateMsg);
    privateSocket.onMessageSent(handlePrivateMsg);
    socket.on("message_deleted", handleMessageDeleted);

    return () => {
      privateSocket.offPrivateMessage();
      socket.off("message_deleted");
      socket.disconnect();
    };
  }, [router, isGroupChat]);

  // 🔄 REFRESH MESSAGES
  const refreshMessages = async () => {
    if (isGroupChat && activeGroupId) {
      // Refresh group messages
      initializeGroupChat(activeGroupId);
      return;
    }

    if (!selectedContact || !currentUser) return;

    if (selectedContact.isAI) {
      setMessages(aiMessages);
      return;
    }

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

  useEffect(() => {
    if (selectedContact?.isAI) {
      setMessages(aiMessages);
    }
  }, [selectedContact, aiMessages]);

  // 📥 AUTO LOAD HISTORY
  useEffect(() => {
    refreshMessages();
  }, [selectedContact, currentUser, activeGroupId, isGroupChat]);

  // 💬 SEND MESSAGE (UPDATED FOR GROUP CHAT)
  const handleSendMessage = async (payload: any) => {
    if (isGroupChat && activeGroupId) {
      // Send group message
      sendGroupMessage({
        message_text: payload.message_text || "",
        file_url: payload.file_url || null,
        file_type: payload.file_type || null,
        audio_url: payload.audio_url || null,
      });
      return;
    }

    if (!selectedContact || !currentUser) return;

    const messageData = {
      sender_id: currentUser.id,
      receiver_id: selectedContact.id,
      message_text: payload.message_text || "",
      file_url: payload.file_url || null,
      file_type: payload.file_type || null,
      audio_url: payload.audio_url || null,
    };

    if (selectedContact.isAI) {
      const userMessage: Message = {
        id: Date.now(),
        sender_id: currentUser.id,
        receiver_id: selectedContact.id,
        message_text: payload.message_text || "",
        created_at: new Date().toISOString(),
      };

      setAiMessages((prev) => [...prev, userMessage]);
      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await api.post("/ai/chat", {
          prompt: payload.message_text,
          userId: currentUser.id,
        });

        const assistantMessage: Message = {
          id: Date.now() + 1,
          sender_id: 0,
          receiver_id: currentUser.id,
          message_text: response.data.data.message_text,
          created_at: new Date().toISOString(),
        };

        setAiMessages((prev) => [...prev, assistantMessage]);
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        console.error("AI response failed:", err);
        const errorMessage: Message = {
          id: Date.now() + 2,
          sender_id: 0,
          receiver_id: currentUser.id,
          message_text: "Sorry, I couldn't reach the AI assistant right now.",
          created_at: new Date().toISOString(),
        };

        setAiMessages((prev) => [...prev, errorMessage]);
        setMessages((prev) => [...prev, errorMessage]);
      }

      return;
    }

    privateSocket.sendPrivateMessage(messageData);
  };

  // 👥 GROUP HANDLERS
  const handleGroupSelect = (group: Group) => {
    setIsGroupChat(true);
    setSelectedContact(null);
    initializeGroupChat(group.id!);
  };

  const handlePrivateChatSelect = (contact: Contact) => {
    setIsGroupChat(false);
    setSelectedContact(contact);
  };

  const handleCreateGroup = async (groupName: string, selectedUsers: number[]) => {
    try {
      await createGroup(groupName, selectedUsers);
      // Ensure groups are refreshed
      if (currentUser?.id) {
        await fetchUserGroups();
      }
      setShowCreateGroupModal(false);
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  // 🚪 LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    socket.disconnect();
    router.push("/login");
  };

  if (!currentUser) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* SIDEBAR - DESKTOP */}
      <div className="hidden md:flex md:w-[30%] md:min-w-[300px] md:flex-col">
        <div className="flex flex-col h-full">
          {/* Header with Create Group button */}
          <div className="p-4 border-b bg-white">
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
            >
              <Users size={18} />
              Create Group
            </button>
          </div>

          {/* Groups section */}
          <div className="flex-1 min-h-0">
            <Sidebar 
              onSelectContact={handlePrivateChatSelect} 
              groups={groups}
              onSelectGroup={handleGroupSelect}
              activeGroupId={activeGroupId}
            />
          </div>
        </div>
      </div>

      {/* SIDEBAR - MOBILE OVERLAY */}
      {showSidebar && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 md:hidden bg-black bg-opacity-50 z-30"
            onClick={() => setShowSidebar(false)}
          />
          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full w-[75%] max-w-[300px] md:hidden z-40 bg-white">
            <div className="flex flex-col h-full">
              {/* Header with Create Group button */}
              <div className="p-4 border-b">
                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                >
                  <Users size={18} />
                  Create Group
                </button>
              </div>

              {/* Groups and Private chats */}
              <div className="flex-1">
                <Sidebar 
                  onSelectContact={(contact) => {
                    handlePrivateChatSelect(contact);
                    setShowSidebar(false);
                  }}
                  groups={groups}
                  onSelectGroup={(group) => {
                    handleGroupSelect(group);
                    setShowSidebar(false);
                  }}
                  activeGroupId={activeGroupId}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col bg-[#efeae2] md:w-[70%]">
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-3 border-b gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden p-1 hover:bg-gray-100 rounded"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-semibold text-sm sm:text-base truncate">
              {isGroupChat
                ? (groups.find(g => g.id === activeGroupId)?.name || "Group Chat")
                : (selectedContact ? selectedContact.name : "Chat")
              }
            </h2>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm rounded whitespace-nowrap"
          >
            Logout
          </button>
        </div>

        {(selectedContact || isGroupChat) ? (
          <>
            <ChatWindow
              contact={selectedContact}
              messages={isGroupChat ? groupMessages : messages}
              currentUserId={currentUser.id}
              refreshMessages={refreshMessages}
              onDeleteRequest={(message) => console.log("Delete message:", message)}
              isGroupChat={isGroupChat}
              groupName={groups.find(g => g.id === activeGroupId)?.name}
            />

            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a user or group to start chatting
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreateGroup={handleCreateGroup}
        currentUserId={currentUser.id}
        users={users}
      />
    </div>
  );
}