import { io } from "socket.io-client";

const BACKEND_URL = "https://chat-app-production-09f2.up.railway.app";

export const socket = io(BACKEND_URL, {
  autoConnect: false,
});