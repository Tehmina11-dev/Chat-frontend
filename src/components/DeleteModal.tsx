"use client";

import React from "react";

interface Props {
  onClose: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  isLoading: boolean;
}

const DeleteModal: React.FC<Props> = ({
  onClose,
  onDeleteForMe,
  onDeleteForEveryone,
  isLoading,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-5 w-[300px] shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          Delete Message?
        </h2>

        <div className="flex flex-col gap-2">
          <button
            onClick={onDeleteForMe}
            disabled={isLoading}
            className="bg-gray-200 py-2 rounded hover:bg-gray-300"
          >
            Delete for Me
          </button>

          <button
            onClick={onDeleteForEveryone}
            disabled={isLoading}
            className="bg-red-500 text-white py-2 rounded hover:bg-red-600"
          >
            Delete for Everyone
          </button>

          <button
            onClick={onClose}
            className="mt-2 text-sm text-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;