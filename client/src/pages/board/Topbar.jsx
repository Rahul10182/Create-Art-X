import React, { useState } from "react";
import ShareModal from "./ShareModal";
import ActiveUsers from "../../components/liveblocks/ActiveUsers";

const Topbar = ({ title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log("[Topbar] Rendering with title:", title); // Debug

  return (
    <div className="w-full flex items-center justify-between bg-gradient-to-r from-[#1e1a16] to-[#372f26] px-6 py-3 shadow-md z-20">
      <h2 className="text-2xl font-harry text-yellow-300">{title}</h2>

      <div className="flex items-center gap-6">
        <div className="bg-black/30 px-3 py-1 rounded-lg">
          <ActiveUsers />
        </div>

        <button
          onClick={() => {
            console.log("[Topbar] Share button clicked");
            setIsModalOpen(true);
          }}
          className="ml-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg shadow-md transition"
          aria-label="Share board"
        >
          Share
        </button>
      </div>

      {isModalOpen && (
        <ShareModal 
          closeModal={() => {
            console.log("[Topbar] Closing share modal");
            setIsModalOpen(false);
          }} 
        />
      )}
    </div>
  );
};

export default Topbar;