import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { shareBoardWithUser } from "../../apis/boardApi";
import { getAllUsers } from "../../apis/userApi";
import { IoClose } from "react-icons/io5";

const ShareModal = ({ closeModal }) => {
  const { boardID } = useParams();
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [usernameMatches, setUsernameMatches] = useState([]);
  const [emailMatches, setEmailMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetching all users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const users = await getAllUsers();
        const userArray = Array.isArray(users) ? users : users.data || [];  // Ensure it's an array
        setAllUsers(userArray);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // Handle user search (username and email)
  useEffect(() => {
    if (query.trim() === "") {
      setUsernameMatches([]);
      setEmailMatches([]);
      return;
    }

    const q = query.toLowerCase();

    const unameMatches = Array.isArray(allUsers)
      ? allUsers.filter((user) => user.username.toLowerCase().includes(q))
      : [];

    const mailMatches = Array.isArray(allUsers)
      ? allUsers.filter((user) => user.email.toLowerCase().includes(q))
      : [];

    setUsernameMatches(unameMatches);
    setEmailMatches(mailMatches);
  }, [query, allUsers]);

  // Share the board with a user
  const handleShare = async (userId) => {
    try {
      await shareBoardWithUser(boardID, userId);
      alert("Board shared successfully!");
      closeModal();
    } catch (error) {
      console.error("Sharing failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
      <div className="bg-white rounded-xl p-6 w-[450px] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-2xl text-black hover:text-red-500"
        >
          <IoClose />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">Share Board</h2>

        <div className="flex mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email or username"
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none"
          />
          <div className="bg-yellow-500 text-black px-4 py-2 rounded-r-lg flex items-center">
            {loading ? "Loading..." : "🔍"}
          </div>
        </div>

        <div className="space-y-4">
          {usernameMatches.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Username Matches</h3>
              {usernameMatches.map((user) => (
                <div
                  key={user._id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <div>
                    <div className="font-bold">{user.username}</div>
                    <div className="text-gray-500 text-sm">{user.email}</div>
                    <div className="text-gray-400 text-xs">UID: {user.firebaseUID}</div>
                  </div>
                  <button
                    onClick={() => handleShare(user._id)}
                    className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Share
                  </button>
                </div>
              ))}
            </div>
          )}

          {emailMatches.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-green-700 mb-2 mt-4">Email Matches</h3>
              {emailMatches.map((user) => (
                <div
                  key={user._id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <div>
                    <div className="font-bold">{user.username}</div>
                    <div className="text-gray-500 text-sm">{user.email}</div>
                    <div className="text-gray-400 text-xs">UID: {user.firebaseUID}</div>
                  </div>
                  <button
                    onClick={() => handleShare(user._id)}
                    className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Share
                  </button>
                </div>
              ))}
            </div>
          )}

          {usernameMatches.length === 0 && emailMatches.length === 0 && query.trim() !== "" && (
            <div className="text-center text-gray-500">
              No users found matching <b>"{query}"</b>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
