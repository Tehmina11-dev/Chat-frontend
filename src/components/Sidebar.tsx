"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Contact } from "../types/index";
import { socket } from "../lib/socket";
import { api } from "../lib/api";

interface SidebarProps {
  onSelectContact: (contact: Contact) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeUsers, setActiveUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Contact | null>(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    if (!storedUser.id || !token) return;

    setCurrentUser({
      id: storedUser.id,
      name: storedUser.username,
      lastMsg: "",
      time: "",
      online: true,
    });

    socket.emit("join", storedUser.id);

    // 🔥 FETCH USERS
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const res = await api.get("/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filteredUsers = res.data
          .filter((u: any) => u.id !== storedUser.id)
          .map((u: any) => ({
            id: u.id,
            name: u.username,
            lastMsg: "",
            time: "",
            online: false,
          }));

        setContacts(filteredUsers);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // 🔥 ACTIVE USERS
    const handleActiveUsers = (userIds: number[]) => {
      setActiveUsers(userIds);
    };

    // 🔥 USER ONLINE/OFFLINE
    const handleUserStatus = ({
      userId,
      online,
    }: {
      userId: number;
      online: boolean;
    }) => {
      setActiveUsers((prev) => {
        if (online) {
          return prev.includes(userId) ? prev : [...prev, userId];
        }
        return prev.filter((id) => id !== userId);
      });
    };

    // 🔥 NEW USER REAL-TIME
    const handleNewUser = (newUser: any) => {
      if (newUser.id === storedUser.id) return;

      setContacts((prev) => {
        const exists = prev.find((u) => u.id === newUser.id);
        if (exists) return prev;

        return [
          ...prev,
          {
            id: newUser.id,
            name: newUser.username,
            lastMsg: "",
            time: "",
            online: false,
          },
        ];
      });
    };

    socket.on("active_users", handleActiveUsers);
    socket.on("user_status", handleUserStatus);
    socket.on("new_user", handleNewUser);

    return () => {
      socket.off("active_users", handleActiveUsers);
      socket.off("user_status", handleUserStatus);
      socket.off("new_user", handleNewUser);
    };
  }, []);

  // 🔥 sync online status
  useEffect(() => {
    setContacts((prev) =>
      prev.map((c) => ({
        ...c,
        online: activeUsers.includes(c.id),
      }))
    );
  }, [activeUsers]);

  return (
    <div className="w-[30%] min-w-[300px] h-full border-r flex flex-col bg-white">

      {/* Current User */}
      {currentUser && (
        <div className="p-3 bg-[#f0f2f5] flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold uppercase">
            {currentUser.name[0]}
          </div>
          <span>{currentUser.name}</span>
        </div>
      )}

      {/* Search */}
      <div className="p-2 border-b">
        <div className="flex items-center bg-[#f0f2f5] px-3 py-2 rounded-lg">
          <Search size={16} className="mr-2 text-gray-500" />
          <input
            placeholder="Search users"
            className="bg-transparent w-full outline-none text-black"
          />
        </div>
      </div>

      {/* Users */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-5 text-center text-gray-500">Loading...</div>
        ) : (
          contacts.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectContact(c)}
              className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b"
            >
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold relative">
                {c.name[0]}
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    c.online ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </div>

              <div className="ml-3">
                <p className="font-medium text-black">{c.name}</p>
                <p className="text-xs text-gray-500">
                  {c.online ? "online" : "offline"}
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