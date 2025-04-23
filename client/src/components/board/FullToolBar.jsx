import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBoardDetails, updateBoardTitle } from '../../apis/boardApis';
import ActiveUsers from "../liveblocks/ActiveUsers.jsx";
import ToolBar from "../board/ToolBar.jsx";

const FullToolBar = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('Untitled');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const board = await getBoardDetails(id);
        setTitle(board.title || 'Untitled');
      } catch (err) {
        console.error("Failed to fetch board details", err);
      }
    };
    fetchBoard();
  }, [id]);

  const handleTitleChange = async (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    try {
      await updateBoardTitle(id, newTitle);
    } catch (err) {
      console.error("Failed to update board title", err);
    }
  };

  return (
    <div className="shadow-lg flex gap-6 rounded-lg m-4 p-2 items-center justify-between w-3/4 mx-auto h-16 bg-white">
      <div 
        className="text-2xl font-extrabold text-blue-500 cursor-pointer hover:text-blue-800 transition-all duration-200"
        onClick={() => navigate('/')}
      >
        colab
      </div>

      <div className="border-l border-gray-300 h-8" />

      <div className="flex-grow">
        <textarea
          className="text-xl font-semibold text-left px-3 py-1 rounded-md h-10 w-full bg-gray-100 resize-none overflow-hidden border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter board title..."
        />
      </div>

      <div className="border-l border-gray-300 h-8" />

      <p className="text-gray-500 text-sm font-medium">
        Saved
      </p>

      <ActiveUsers />

      <ToolBar />
    </div>
  );
};

export default FullToolBar 
