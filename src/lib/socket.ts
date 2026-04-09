// lib/socket.ts
import { io } from "socket.io-client";

export const socket = io("https://chat-app-production-09f2.up.railway.app", {
  autoConnect: false,
});