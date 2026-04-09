"use client";

import React from 'react';

// Yaad rakhein: "export default" likhna lazmi hai
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f0f2f5] p-24">
      <div className="text-center bg-white p-10 rounded-2xl shadow-xl border-t-8 border-[#00a884]">
        <h1 className="text-4xl font-bold text-[#41525d] mb-4">Chat-App</h1>
        <p className="text-gray-500 mb-8 font-light text-lg">
          System is online. Ready to build the interface.
        </p>
        
        <a 
          href="/chat" 
          className="bg-[#00a884] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#008f6f] transition-all shadow-md"
        >
          Open Chat Dashboard
        </a>
      </div>
    </main>
  );
}