// lib/socket.ts
import { io } from "socket.io-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export const socket = io(BACKEND_URL!, {
  autoConnect: false,
});