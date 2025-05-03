import React, { useState } from "react";
import ShareModal from "./ShareModal";
import ChatModal from "../../components/chat/ChatModal";
import ActiveUsers from "../../components/liveblocks/ActiveUsers";
import { FaShare, FaComments } from "react-icons/fa";

const Topbar = ({ title }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  return (
    <div className="w-full flex items-center justify-between bg-gradient-to-r from-[#1e1a16] to-[#372f26] px-6 py-3 shadow-md z-20">
      <h2 className="text-2xl font-harry text-yellow-300">{title}</h2>

      <div className="flex items-center gap-6">
        <div className="bg-black/30 px-3 py-1 rounded-lg">
          <ActiveUsers />
        </div>

        <button
          onClick={() => setIsChatModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition"
        >
          <FaComments /> Chat
        </button>

        <button
          onClick={() => setIsShareModalOpen(true)}
          className="ml-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg shadow-md transition flex items-center gap-2"
        >
          <FaShare /> Share
        </button>
      </div>

      {/* Share Modal (centered) */}
      {isShareModalOpen && (
        <ShareModal 
          closeModal={() => setIsShareModalOpen(false)} 
        />
      )}

      {/* Chat Modal (slides from right) */}
      {isChatModalOpen && (
        <ChatModal 
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Topbar;