import axios from "axios";

const API_URL = "https://chat-app-production-09f2.up.railway.app/api";

export const api = axios.create({
  baseURL: API_URL,
});