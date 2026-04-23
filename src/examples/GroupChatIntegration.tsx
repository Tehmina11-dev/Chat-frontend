// Example usage of group chat functionality
// This shows how to integrate the group chat hooks and components

"use client";

import { useState, useEffect } from "react";
import { useGroupChat } from "../hooks/useGroupChat";
import { socket, privateSocket } from "../lib/socket";
import { Group, GroupMessage, Message, User } from "../types";
import ChatWindow from "../components/ChatWindow";
import CreateGroupModal from "../components/CreateGroupModal";

// Example component showing group chat integration
export default function GroupChatExample() {
  const [currentUserId, setCurrentUserId] = useState<number>(1); // From auth
  const [users, setUsers] = useState<User[]>([]); // Fetch from API
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [privateMessages, setPrivateMessages] = useState<Message[]>([]);

  // Group chat hook
  const {
    groups,
    activeGroupId,
    groupMessages,
    loading: groupsLoading,
    initializeGroupChat,
    sendGroupMessage,
    createGroup,
  } = useGroupChat(currentUserId);

  // Initialize socket connection
  useEffect(() => {
    socket.connect();
    privateSocket.joinPrivateChat(currentUserId);

    // Listen for private messages
    privateSocket.onPrivateMessage((message: Message) => {
      setPrivateMessages(prev => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  // Handle group creation
  const handleCreateGroup = async (groupName: string, selectedUsers: number[]) => {
    try {
      await createGroup(groupName, selectedUsers);
      console.log("Group created successfully");
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  // Handle sending group message
  const handleSendGroupMessage = (data: {
    message_text?: string;
    file_url?: string;
    audio_url?: string;
    file_type?: string;
  }) => {
    sendGroupMessage(data);
  };

  // Handle group selection
  const handleGroupSelect = (group: Group) => {
    initializeGroupChat(group.id!);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar with groups and private chats */}
      <div className="w-1/4 bg-white border-r">
        <button
          onClick={() => setShowCreateGroupModal(true)}
          className="w-full p-4 bg-primary text-white font-medium"
        >
          Create Group
        </button>

        {/* Groups list */}
        <div className="p-4">
          <h3 className="font-semibold mb-2">Groups</h3>
          {groupsLoading ? (
            <div>Loading groups...</div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                onClick={() => handleGroupSelect(group)}
                className={`p-2 cursor-pointer rounded ${
                  activeGroupId === group.id ? "bg-secondary" : "hover:bg-gray-100"
                }`}
              >
                {group.name}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col">
        {activeGroupId ? (
          // Group chat
          <ChatWindow
            contact={null}
            messages={groupMessages}
            currentUserId={currentUserId}
            refreshMessages={() => initializeGroupChat(activeGroupId)}
            onDeleteRequest={(message) => console.log("Delete group message:", message)}
            isGroupChat={true}
            groupName={groups.find(g => g.id === activeGroupId)?.name}
          />
        ) : (
          // Private chat (existing logic)
          <ChatWindow
            contact={null} // Your selected contact
            messages={privateMessages}
            currentUserId={currentUserId}
            refreshMessages={() => console.log("Refresh private messages")}
            onDeleteRequest={(message) => console.log("Delete private message:", message)}
            isGroupChat={false}
          />
        )}

        {/* Message input would go here */}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreateGroup={handleCreateGroup}
        currentUserId={currentUserId}
        users={users}
      />
    </div>
  );
}