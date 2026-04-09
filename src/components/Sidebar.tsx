"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, MoreVertical, MessageSquare, CircleDashed } from "lucide-react";
import { Contact } from "../types/index"; // Path check
import { socket } from "../lib/socket";

interface SidebarProps {
  onSelectContact: (contact: Contact) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeUsers, setActiveUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Contact | null>(null);

  useEffect(() => {
    // Get logged-in user info and token
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    if (!storedUser.id) return;

    setCurrentUser({
      id: storedUser.id,
      name: storedUser.username,
      lastMsg: "",
      time: "",
      online: true,
    });

    const handleActiveUsers = (userIds: number[]) => {
      setActiveUsers(userIds.filter((id) => id !== storedUser.id));
    };

    const handleUserStatus = ({ userId, online }: { userId: number; online: boolean }) => {
      setActiveUsers((prev) => {
        if (online) {
          return prev.includes(userId) ? prev : [...prev, userId];
        }
        return prev.filter((id) => id !== userId);
      });
    };

    socket.on("active_users", handleActiveUsers);
    socket.on("user_status", handleUserStatus);

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const otherUsers = response.data
          .filter((u: any) => u.id !== storedUser.id)
          .map((u: any) => ({
            id: u.id,
            name: u.username,
            lastMsg: "",
            time: "",
            online: activeUsers.includes(u.id),
          }));

        setContacts(otherUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUsers();

    return () => {
      socket.off("active_users", handleActiveUsers);
      socket.off("user_status", handleUserStatus);
    };
  }, []);

  useEffect(() => {
    setContacts((prev) =>
      prev.map((contact) => ({
        ...contact,
        online: activeUsers.includes(contact.id),
      }))
    );
  }, [activeUsers]);

  return (
    <div className="w-[30%] min-w-[300px] h-full border-r border-gray-300 flex flex-col bg-white">
      {/* Header - Current User Profile */}
      {currentUser && (
        <div className="p-3 bg-[#f0f2f5] flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center text-white font-bold uppercase">
            {currentUser.name[0]}
          </div>
          <span className="font-medium">{currentUser.name}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-2 bg-white border-b border-gray-100">
        <div className="flex items-center bg-[#f0f2f5] px-3 py-1.5 rounded-lg">
          <Search size={16} className="text-gray-500 mr-4" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="bg-transparent text-sm outline-none w-full py-1 placeholder:text-gray-500 text-black"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto bg-white scrollbar-hide">
        {loading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00a884]"></div>
          </div>
        ) : contacts.length > 0 ? (
          contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className="flex items-center p-3 cursor-pointer hover:bg-[#f5f6f6] border-b border-gray-50 transition active:bg-[#ebebeb]"
            >
              <div className="w-12 h-12 rounded-full bg-[#bed0f9] mr-3 flex items-center justify-center font-semibold text-[#1E3A8A] uppercase border border-white relative">
                {contact.name[0]}
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    contact.online ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-normal text-[16px] text-[#111b21]">{contact.name}</h3>
                    {contact.online && (
                      <span className="text-[10px] text-green-600 uppercase tracking-[0.1em]">
                        online
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] text-gray-500">{contact.time || ""}</span>
                </div>
                <p className="text-sm text-[#667781] truncate">
                  {contact.lastMsg || "Click to start conversation"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-gray-400 text-sm">
            No other users found on the platform.
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;