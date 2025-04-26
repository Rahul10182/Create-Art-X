import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { shareBoardWithUser } from "../../apis/boardApi";
import { getAllUsers } from "../../apis/userApi";
import { IoClose, IoCheckmark } from "react-icons/io5";
import { toast } from "react-hot-toast"; // using react-hot-toast

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
          success: 'Board shared successfully 🎯!',
          error: 'Failed to share board ❌',
        }
      );
      closeModal();
    } catch (error) {
      console.error("Sharing failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-2xl p-6 w-[450px] max-h-[90vh] overflow-y-auto relative shadow-2xl">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-2xl text-gray-600 hover:text-red-600"
        >
          <IoClose />
        </button>

        <h2 className="text-3xl font-bold mb-4 text-center text-indigo-700">Share Board</h2>

        <div className="flex mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none"
          />
          <div className="bg-indigo-500 text-white px-4 py-2 rounded-r-lg flex items-center">
            {loading ? "Loading..." : "🔍"}
          </div>
        </div>

        <div className="space-y-4">
          {matches.length > 0 ? (
            matches.map((user) => (
              <div
                key={user._id}
                className="flex justify-between items-center border p-2 rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">{user.name}</span>
                  <span className="text-sm text-gray-600">@{user.username}</span>
                  <span className="text-sm text-gray-400">{user.email}</span>
                </div>

                {alreadyShared(user._id) ? (
                  <div className="text-green-500 text-2xl">
                    <IoCheckmark />
                  </div>
                ) : (
                  <button
                    onClick={() => handleShare(user._id)}
                    className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Share
                  </button>
                )}
              </div>
            ))
          ) : query.trim() !== "" ? (
            <div className="text-center text-gray-500">
              No users found for "<b>{query}</b>".
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
