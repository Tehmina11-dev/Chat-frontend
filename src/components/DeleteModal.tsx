"use client";

import React from "react";
import { Trash2, X } from "lucide-react";

interface Props {
  onClose: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  isLoading?: boolean;
}

const DeleteModal: React.FC<Props> = ({
  onClose,
  onDeleteForMe,
  onDeleteForEveryone,
  isLoading = false,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl w-full sm:w-96 shadow-2xl animate-in fade-in scale-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Delete Message?</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* DIVIDER */}
        <div className="h-px bg-gray-200 mb-4" />

        {/* DELETE FOR ME */}
        <button
          onClick={onDeleteForMe}
          disabled={isLoading}
          className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition text-left mb-2 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Trash2 size={18} className="text-gray-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">Delete for me</p>
            <p className="text-xs text-gray-500">Only removed from your chat</p>
          </div>
        </button>

        {/* DELETE FOR EVERYONE */}
        <button
          onClick={onDeleteForEveryone}
          disabled={isLoading}
          className={`w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition text-left ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Trash2 size={18} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-600">Delete for everyone</p>
            <p className="text-xs text-gray-500">Removed from all chats</p>
          </div>
        </button>

        {/* CANCEL BUTTON */}
        <button
          onClick={onClose}
          className="w-full text-center p-3 mt-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-semibold text-gray-700"
        >
          Cancel
        </button>

      </div>
    </div>
  );
};

export default DeleteModal;