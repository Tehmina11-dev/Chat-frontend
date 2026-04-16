"use client";

import React from "react";

interface Props {
  onClose: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
}

const DeleteModal: React.FC<Props> = ({
  onClose,
  onDeleteForMe,
  onDeleteForEveryone,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 sm:p-5 rounded-lg w-full sm:w-72 shadow-lg">

        <h2 className="text-base sm:text-lg font-semibold mb-4">Delete Message?</h2>

        <button
          onClick={onDeleteForMe}
          className="w-full text-left p-2 hover:bg-gray-100 text-sm sm:text-base rounded"
        >
          Delete for me
        </button>

        <button
          onClick={onDeleteForEveryone}
          className="w-full text-left p-2 hover:bg-gray-100 text-red-500 text-sm sm:text-base mt-1 rounded"
        >
          Delete for everyone
        </button>

        <button
          onClick={onClose}
          className="w-full text-left p-2 mt-2 text-gray-500 text-sm sm:text-base rounded"
        >
          Cancel
        </button>

      </div>
    </div>
  );
};

export default DeleteModal;