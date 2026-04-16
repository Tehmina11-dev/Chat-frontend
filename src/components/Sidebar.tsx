"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { socket } from "../lib/socket";
import { api } from "../lib/api";
import { Contact } from "../types";

interface SidebarProps {
  onSelectContact: (contact: Contact) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeUsers, setActiveUsers] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Contact | null>(null);

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
    <div className="w-[30%] min-w-[300px] h-full border-r flex flex-col bg-white">

      {/* 👤 CURRENT USER */}
      {currentUser && (
        <div className="p-3 bg-gray-100 flex items-center gap-3 border-b">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
            {currentUser.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold">{currentUser.name}</p>
            <p className="text-xs text-green-600">online</p>
          </div>
        </div>
      )}

      {/* 🔍 SEARCH */}
      <div className="p-3 border-b flex items-center gap-2">
        <Search size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full outline-none text-sm"
        />
      </div>

      {/* 👥 USERS */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="p-3 text-gray-500">Loading...</p>
        ) : (
          filteredContacts.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectContact(c)}
              className="p-3 flex items-center gap-3 border-b hover:bg-gray-100 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                {c.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-medium">{c.name}</p>
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