"use client";

import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f0f2f5] p-24">
      <div className="text-center bg-white p-10 rounded-2xl shadow-xl border-t-8 border-[#00a884]">
        
        <h1 className="text-4xl font-bold text-[#41525d] mb-4">Chat-App</h1>
        
        <p className="text-gray-500 mb-8 font-light text-lg">
          System is online. Ready to build the interface.
        </p>
        
        {/* Login Button */}
        <a 
          href="/login" 
          className="bg-[#00a884] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#008f6f] transition-all shadow-md"
        >
          Login
        </a>

        {/* Signup Option */}
        <p className="mt-6 text-gray-600">
          Don’t have an account?{" "}
          <a 
            href="/signup" 
            className="text-[#00a884] font-semibold hover:underline"
          >
            Sign up
          </a>
        </p>

      </div>
    </main>
  );
}
