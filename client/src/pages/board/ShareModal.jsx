import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { shareBoardWithUser } from "../../apis/boardApi";
import { getAllUsers } from "../../apis/userApi";
import { IoClose, IoCheckmark } from "react-icons/io5";
import { toast } from "react-hot-toast";

const ShareModal = ({ closeModal, sharedWith = [] }) => {
  const { boardID } = useParams();
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const users = await getAllUsers();
        console.log(users);
        const userArray = Array.isArray(users) ? users : users.data || [];
        const filteredUsers = userArray.filter(user => user.firebaseUID !== currentUser.uid);
        setAllUsers(filteredUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    if (query.trim() === "") {
      setMatches([]);
      return;
    }
    const q = query.toLowerCase();
    const filteredMatches = allUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.name && user.name.toLowerCase().includes(q))
    );
    setMatches(filteredMatches);
  }, [query, allUsers]);

  const alreadyShared = (userId) => sharedWith.includes(userId);

  const handleShare = async (userId) => {
    try {
      toast.promise(
        shareBoardWithUser(boardID, userId),
        {
          loading: 'Sharing board...',
          success: 'Board shared successfully! ✨',
          error: 'Failed to share board',
        }
      );
      closeModal();
    } catch (error) {
      console.error("Sharing failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1e1a16] to-[#372f26] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative border-2 border-yellow-600 shadow-[0_0_20px_rgba(210,180,40,0.5)]">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-2xl text-yellow-400 hover:text-yellow-200 transition-colors"
        >
          <IoClose />
        </button>

        <h2 className="text-2xl font-harry text-yellow-300 mb-4 text-center">Share This Board</h2>

        <div className="flex mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search wizards..."
            className="flex-1 bg-gray-800 text-white border border-yellow-600 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-gray-400"
          />
          <div className="bg-yellow-600 text-black px-4 py-2 rounded-r-lg flex items-center font-semibold">
            {loading ? "🔮 Searching..." : "🔍"}
          </div>
        </div>

        <div className="space-y-3">
          {matches.length > 0 ? (
            matches.map((user) => (
              <div
                key={user._id}
                className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-yellow-600/50 hover:bg-black/40 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-yellow-300">{user.name || user.username}</span>
                  <span className="text-sm text-gray-300">@{user.username}</span>
                  <span className="text-xs text-gray-400">{user.email}</span>
                </div>

                {alreadyShared(user._id) ? (
                  <div className="text-green-400 text-2xl">
                    <IoCheckmark />
                  </div>
                ) : (
                  <button
                    onClick={() => handleShare(user._id)}
                    className="text-sm bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-3 py-1 rounded transition-colors"
                  >
                    Share
                  </button>
                )}
              </div>
            ))
          ) : query.trim() !== "" ? (
            <div className="text-center text-yellow-300 italic">
              No wizards found for "<span className="font-bold">{query}</span>"
            </div>
          ) : (
            <div className="text-center text-yellow-300 italic">
              Search for wizards to share with...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;