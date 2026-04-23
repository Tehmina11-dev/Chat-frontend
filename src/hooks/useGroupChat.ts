"use client";

import { useState, useEffect, useCallback } from "react";
import { Group, GroupMessage, User } from "../types";
import { groupsApi } from "../lib/api";
import { groupSocket } from "../lib/socket";

export const useGroupChat = (currentUserId: number) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's groups
  const fetchUserGroups = useCallback(async () => {
    try {
      setLoading(true);
      const userGroups = await groupsApi.getUserGroups(currentUserId);
      console.log("Fetched groups:", userGroups);
      setGroups(userGroups);
    } catch (error) {
      console.error("Failed to fetch user groups:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Fetch messages for a specific group
  const fetchGroupMessages = useCallback(async (groupId: number) => {
    try {
      const response = await groupsApi.getGroupMessages(groupId);
      setGroupMessages(response.messages);
    } catch (error) {
      console.error("Failed to fetch group messages:", error);
    }
  }, []);

  // Initialize group chat connection
  const initializeGroupChat = useCallback((groupId: number) => {
    // Leave previous group if any
    if (activeGroupId && activeGroupId !== groupId) {
      groupSocket.leaveGroupChat(activeGroupId);
    }

    // Join new group
    groupSocket.initializeGroupChat(currentUserId, groupId);
    setActiveGroupId(groupId);

    // Fetch messages for the group
    fetchGroupMessages(groupId);
  }, [activeGroupId, currentUserId, fetchGroupMessages]);

  // Send group message
  const sendGroupMessage = useCallback((data: {
    message_text?: string;
    file_url?: string;
    audio_url?: string;
    file_type?: string;
  }) => {
    if (!activeGroupId) return;

    groupSocket.sendGroupMessage({
      sender_id: currentUserId,
      group_id: activeGroupId,
      ...data,
    });
  }, [activeGroupId, currentUserId]);

  // Create new group
  const createGroup = useCallback(async (groupName: string, memberIds: number[]) => {
    try {
      console.log("Creating group:", groupName, "with members:", memberIds, "created by:", currentUserId);
      const result = await groupsApi.createGroup(groupName, memberIds, currentUserId);
      console.log("Group created result:", result);
      // Refresh groups list
      await fetchUserGroups();
      return result;
    } catch (error) {
      console.error("Failed to create group:", error);
      throw error;
    }
  }, [currentUserId, fetchUserGroups]);

  // Set up socket listeners
  useEffect(() => {
    const handleGroupMessage = (message: GroupMessage) => {
      setGroupMessages((prev) => [...prev, message]);
    };

    const handleGroupMessageSent = (message: GroupMessage) => {
      setGroupMessages((prev) => [...prev, message]);
    };

    const handleGroupMessageError = (error: { error: string }) => {
      console.error("Group message error:", error);
    };

    groupSocket.onGroupMessage(handleGroupMessage);
    groupSocket.onGroupMessageSent(handleGroupMessageSent);
    groupSocket.onGroupMessageError(handleGroupMessageError);

    return () => {
      groupSocket.offGroupMessage();
    };
  }, []);

  // Load groups on mount
  useEffect(() => {
    if (currentUserId) {
      fetchUserGroups();
    }
  }, [currentUserId, fetchUserGroups]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeGroupId) {
        groupSocket.leaveGroupChat(activeGroupId);
      }
    };
  }, [activeGroupId]);

  return {
    groups,
    activeGroupId,
    groupMessages,
    loading,
    fetchUserGroups,
    fetchGroupMessages,
    initializeGroupChat,
    sendGroupMessage,
    createGroup,
    setActiveGroupId,
  };
};