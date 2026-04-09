"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api'; // ✅ use centralized axios instance

export default function SignupPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Common handler for all input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ Use centralized API instance instead of localhost
      const response = await api.post('/api/auth/signup', formData);
      
      alert("Account created successfully! Redirecting to login...");
      router.push('/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Signup failed.';
      setError(errorMessage);
      console.error("Signup Error Details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#f0f2f5]">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 border-t-4 border-[#00a884]">
        <h2 className="text-2xl font-bold mb-2 text-[#41525d] text-center text-black font-heading">Create Account</h2>
        <p className="text-gray-500 text-sm text-center mb-6">Join our Chat App today</p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-2 mb-4 animate-pulse">
            <p className="text-red-700 text-xs text-center font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 ml-1">Username</label>
            <input 
              type="text" 
              name="username"
              placeholder="e.g. noor_dev" 
              className="w-full p-3 border rounded outline-[#00a884] text-black bg-white focus:ring-1 focus:ring-[#00a884]"
              value={formData.username}
              onChange={handleChange}
              required 
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 ml-1">Email</label>
            <input 
              type="email" 
              name="email"
              placeholder="noor@example.com" 
              className="w-full p-3 border rounded outline-[#00a884] text-black bg-white focus:ring-1 focus:ring-[#00a884]"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 ml-1">Password</label>
            <input 
              type="password" 
              name="password"
              placeholder="••••••••" 
              className="w-full p-3 border rounded outline-[#00a884] text-black bg-white focus:ring-1 focus:ring-[#00a884]"
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#00a884] text-white p-3 rounded font-semibold hover:bg-[#008f6f] transition disabled:opacity-50 shadow-sm mt-2"
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-[#00a884] font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}