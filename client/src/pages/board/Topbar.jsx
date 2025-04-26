import React, { useState } from "react";
import ShareModal from "./ShareModal";
import ActiveUsers from "../../components/liveblocks/ActiveUsers";

const Topbar = ({ title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full flex items-center justify-between bg-gradient-to-r from-[#1e1a16] to-[#372f26] px-6 py-3 shadow-md z-20">
      {/* Title */}
      <h2 className="text-2xl font-harry text-yellow-300">{title}</h2>

      {/* Active Users */}
      <div className="flex items-center gap-4">
        <ActiveUsers />

        {/* Share Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg shadow-md transition"
        >
          Share
        </button>
      </div>

      {/* Share Modal */}
      {isModalOpen && (
        <ShareModal closeModal={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default Topbar;
