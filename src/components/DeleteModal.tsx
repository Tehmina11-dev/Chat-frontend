"use client";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  isLoading: boolean;
  canDeleteForEveryone: boolean;
}

const DeleteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onDeleteForMe,
  onDeleteForEveryone,
  isLoading,
  canDeleteForEveryone,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Delete message?</h2>
        
        <div className="flex flex-col gap-3">
          {canDeleteForEveryone && (
            <button
              onClick={onDeleteForEveryone}
              disabled={isLoading}
              className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition disabled:opacity-50"
            >
              Delete for everyone
            </button>
          )}

          <button
            onClick={onDeleteForMe}
            disabled={isLoading}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-medium transition disabled:opacity-50"
          >
            Delete for me
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-blue-500 font-semibold hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;