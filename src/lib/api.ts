import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
});