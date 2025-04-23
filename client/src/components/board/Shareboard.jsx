import React, { useEffect, useState } from 'react';
import { fetchAllUsers } from '../../apis/userApi';
import { shareBoardWithUser } from '../../apis/boardApi';
import AddUser from './AddUser';

const ShareBoard = ({ boardId }) => {
  const [email, setEmail] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const users = await fetchAllUsers();
        setAllUsers(users);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    getUsers();
  }, []);

  const handleChange = (e) => {
    const query = e.target.value.toLowerCase();
    setEmail(query);
    const filtered = allUsers.filter((user) =>
      user.email.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/board/${boardId}`;
    navigator.clipboard.writeText(link).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  const handleAddUser = async (userId) => {
    try {
      await shareBoardWithUser(boardId, userId);
      alert('User added to board!');
    } catch (err) {
      console.error("Error sharing board:", err);
      alert('Failed to share board');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-96">
      <h2 className="text-xl font-semibold mb-4">Share this design</h2>

      <div className="mb-4">
        <label className="font-medium text-gray-700">People with access</label>
        <input
          type="text"
          placeholder="Search users by email"
          className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={email}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4 h-[300px] overflow-y-auto space-y-3">
        {filteredUsers.map((user) => (
          <AddUser key={user._id} user={user} onAdd={() => handleAddUser(user._id)} />
        ))}
      </div>

      <div className="mb-4">
        <label className="font-medium text-gray-700 mb-2 block">Collaboration link</label>
        <button
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          onClick={handleCopyLink}
        >
          Copy link
        </button>
      </div>
    </div>
  );
};

export default ShareBoard;
