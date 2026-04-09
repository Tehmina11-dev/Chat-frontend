"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api'; // ✅ use your centralized axios instance

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use the centralized api instance
      const response = await api.post('/auth/login', formData);
      
      // 1️⃣ Save token and user info locally
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // 2️⃣ Navigate to chat page
      router.push('/chat');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#f0f2f5]">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 border-t-4 border-[#00a884]">
        <h2 className="text-2xl font-bold mb-6 text-[#41525d] text-center text-black">Login to Chat</h2>
        {error && <p className="text-red-500 text-xs text-center mb-4 bg-red-50 p-2">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-3 border rounded outline-[#00a884] text-black bg-white"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border rounded outline-[#00a884] text-black bg-white"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required 
          />
          <button 
            disabled={loading}
            className="w-full bg-[#00a884] text-white p-3 rounded font-semibold hover:bg-[#008f6f] transition"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}