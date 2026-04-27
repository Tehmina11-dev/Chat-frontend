import axios from "axios";
import { Group, GroupMessage } from "../types";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_URL,
});

// Groups API functions
export const groupsApi = {
  // Create a new group
  createGroup: async (groupName: string, memberIds: number[], createdBy: number): Promise<{ group: Group; members: number[] }> => {
    const response = await api.post("/groups/create", {
      name: groupName,
      created_by: createdBy,
      member_ids: memberIds,
    });
    return response.data.data;
  },

  // Get all groups for a user
  getUserGroups: async (userId: number): Promise<Group[]> => {
    const response = await api.get(`/groups/user/${userId}`);
    return response.data;
  },

  // Get messages for a specific group
  getGroupMessages: async (groupId: number): Promise<{ groupId: number; messages: GroupMessage[] }> => {
    const response = await api.get(`/groups/${groupId}/messages`);
    return response.data;
  },
};