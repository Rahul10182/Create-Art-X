import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoardDetails, updateBoardTitle, deleteBoard } from '../../apis/boardApi';
import castle from '../../assets/castle.jpg';
import train from '../../assets/train.jpg';

const backgroundImages = [castle, train];

const getRandomBackgroundImage = () => {
  const randomIndex = Math.floor(Math.random() * backgroundImages.length);
  return backgroundImages[randomIndex];
};

const BoardCard = ({ boardID, setAllBoards, allBoards }) => {
  const [title, setTitle] = useState('');
  const [admin, setAdmin] = useState('');
  const [backgroundImageURL, setBackgroundImageURL] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const data = await getBoardDetails(boardID);
        if (data) {
          setTitle(data.title);
          setAdmin(data.admin);
          setBackgroundImageURL(getRandomBackgroundImage());
        }
      } catch (err) {
        console.error('Failed to load board details:', err);
      }
    };

    fetchBoard();
  }, [boardID]);

  const handleSaveTitle = async () => {
    try {
      await updateBoardTitle(boardID, newTitle);
      setTitle(newTitle);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBoard(boardID);
      if (setAllBoards && allBoards) {
        const updatedBoards = allBoards.filter(board => board._id !== boardID);
        setAllBoards(updatedBoards);
      }
    } catch (error) {
      console.log("Error deleting board:", error);
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div
        className="relative w-full h-64 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.3)] overflow-hidden transform hover:scale-105 transition duration-300 border-2 border-yellow-600"
        style={{
          backgroundImage: `url(${backgroundImageURL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[url('/assets/parchment-texture.jpg')] opacity-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>

        <div className="absolute bottom-0 p-4 w-full text-yellow-200 font-harry">
          {isEditing ? (
            <div>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2 rounded bg-white/90 text-black mb-2 shadow-inner"
                placeholder="Enter new title"
              />
              <button
                onClick={handleSaveTitle}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 text-sm rounded mr-2 shadow-md"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold truncate drop-shadow-[0_0_3px_gold]">{title || 'Untitled'}</h3>
              <div className="flex mt-3 gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`/create/${boardID}`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 text-xs rounded shadow-lg"
                >
                  Open
                </button>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setNewTitle(title);
                  }}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 text-xs rounded shadow-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="bg-red-500 hover:bg-red-600 text-black px-3 py-1 text-xs rounded shadow-lg"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className=" bg-gradient-to-b from-[#1e1a16] to-[#372f26] rounded-lg shadow-xl p-4 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-3 text-white">Confirm Deletion</h2>
            <p className="text-sm text-gray-100 mb-4">Are you sure you want to delete this board?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-sm px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoardCard;
