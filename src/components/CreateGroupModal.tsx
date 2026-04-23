"use client";

import { useState, useEffect } from "react";
import { User } from "../types";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupName: string, selectedUsers: number[]) => void;
  currentUserId: number;
  users: User[]; // List of all users to select from
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreateGroup,
  currentUserId,
  users,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter users based on search term, exclude current user
  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentUserId &&
      (user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUserToggle = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      await onCreateGroup(groupName.trim(), selectedUsers);
      // Reset form
      setGroupName("");
      setSelectedUsers([]);
      setSearchTerm("");
      onClose();
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setGroupName("");
    setSelectedUsers([]);
    setSearchTerm("");
    onClose();
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setGroupName("");
      setSelectedUsers([]);
      setSearchTerm("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-card max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-6">
          <h2 className="text-xl font-heading font-semibold text-center">
            Create New Group
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Group Name Input */}
          <div>
            <label
              htmlFor="groupName"
              className="block text-sm font-medium text-gray-700 mb-2 font-sans"
            >
              Group Name
            </label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-sans"
              maxLength={50}
            />
          </div>

          {/* Search Users */}
          <div>
            <label
              htmlFor="searchUsers"
              className="block text-sm font-medium text-gray-700 mb-2 font-sans"
            >
              Add Members ({selectedUsers.length} selected)
            </label>
            <input
              id="searchUsers"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by email or username..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-4 font-sans"
            />

            {/* Users List */}
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500 font-sans">
                  {searchTerm ? "No users found" : "No users available"}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center p-3 hover:bg-secondary transition-colors"
                    >
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserToggle(user.id)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label
                        htmlFor={`user-${user.id}`}
                        className="ml-3 flex-1 cursor-pointer"
                      >
                        <div className="font-medium text-gray-900 font-sans">
                          {user.username || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-500 font-sans">
                          {user.email}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 bg-gray-50">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-sans font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length === 0 || isLoading}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans font-medium"
          >
            {isLoading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}