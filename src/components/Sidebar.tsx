"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { socket } from "../lib/socket";
import { api } from "../lib/api";
import { Contact, Group } from "../types";

interface SidebarProps {
  onSelectContact: (contact: Contact) => void;
  groups?: Group[];
  onSelectGroup?: (group: Group) => void;
  activeGroupId?: number | null;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectContact, groups = [], onSelectGroup, activeGroupId }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeUsers, setActiveUsers] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Contact | null>(null);

  const aiContact: Contact = {
    id: -9999,
    name: "AI Assistant",
    lastMsg: "Ask anything",
    time: "",
    online: true,
    isAI: true,
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    if (!user.id || !token) return;

    setCurrentUser({
      id: user.id,
      name: user.username || "Me",
      lastMsg: "",
      time: "",
      online: true,
    });

    // socket.emit("join", user.id); // Removed - this is called in ChatPage


    const fetchUsers = async () => {
      try {
        setLoading(true);

        const res = await api.get("/auth/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const formatted = res.data
          .filter((u: any) => u.id !== user.id)
          .map((u: any) => ({
            id: u.id,
            name: u.username || "Unknown User",
            lastMsg: "",
            time: "",
            online: false,
          }));

        setContacts(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // 👇 ONLINE USERS LIST
    socket.on("active_users", (userIds: number[]) => {
      setActiveUsers(userIds);
    });

    // 👇 SINGLE USER STATUS UPDATE
    socket.on("user_status", ({ userId, online }) => {
      setActiveUsers((prev) => {
        if (online) {
          return prev.includes(userId) ? prev : [...prev, userId];
        } else {
          return prev.filter((id) => id !== userId);
        }
      });
    });

    return () => {
      socket.off("active_users");
      socket.off("user_status");
    };
  }, []);

  // 🔍 SEARCH
  const filteredContacts = contacts.filter((c) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full h-full border-r flex flex-col bg-white">

      {/* 👤 CURRENT USER */}
     {currentUser && (
  <div className="p-3 bg-gray-100 flex items-center gap-3 border-b flex-shrink-0">
    
    {/* Avatar */}
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
      {currentUser.name?.charAt(0).toUpperCase()}
    </div>

    {/* User Info */}
    <div>
      <p className="text-sm font-semibold">{currentUser.name}</p>
      <div className="text-xs text-green-600">online</div>
    </div>

  </div>
)}

      {/* AI ASSISTANT */}
      <div
        onClick={() => onSelectContact(aiContact)}
        className="p-3 bg-yellow-50 border-b cursor-pointer hover:bg-yellow-100 transition-colors flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xs">
            AI
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">AI Assistant</p>
            <p className="text-xs text-gray-600 truncate">Ask questions and get smart replies</p>
          </div>
        </div>
      </div>

      {/* 🔍 SEARCH */}
      <div className="p-2 sm:p-3 border-b flex items-center gap-2 flex-shrink-0">
        <Search size={18} className="flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full outline-none text-sm"
        />
      </div>

      {/* 👥 GROUPS */}
      {groups.length > 0 && (
        <div className="border-b flex-shrink-0">
          <div className="p-2 sm:p-3">
            <h3 className="font-semibold text-gray-700 text-sm mb-2">Groups</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => onSelectGroup?.(group)}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    activeGroupId === group.id
                      ? "bg-secondary border-l-4 border-primary"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium text-sm">{group.name}</div>
                  <div className="text-xs text-gray-500">
                    {group.created_at ? new Date(group.created_at).toLocaleDateString() : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 👥 USERS */}
      <div className="flex-1 overflow-y-auto min-h-0 scroll-smooth">
        {loading ? (
          <p className="p-3 text-gray-500 text-sm">Loading...</p>
        ) : (
          filteredContacts.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectContact(c)}
              className="p-2 sm:p-3 flex items-center gap-2 sm:gap-3 border-b hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                {c.name?.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium truncate">{c.name}</p>
                <p className="text-xs text-gray-500">
                  {activeUsers.includes(c.id) ? "online" : "offline"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;