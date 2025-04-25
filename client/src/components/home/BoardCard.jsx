import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoardDetails, updateBoardTitle } from '../../apis/boardApi';
import castle from '../../assets/castle.jpg'; 
import train from '../../assets/train.jpg';

const backgroundImages = [castle, train];

const getRandomBackgroundImage = () => {
  const randomIndex = Math.floor(Math.random() * backgroundImages.length);
  return backgroundImages[randomIndex];
};

const BoardCard = ({ boardID }) => {
  const [title, setTitle] = useState('');
  const [admin, setAdmin] = useState('');
  const [backgroundImageURL, setBackgroundImageURL] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
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

  return (
    <div
      className="relative w-full h-64 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.3)] overflow-hidden transform hover:scale-105 transition duration-300 border-2 border-yellow-600"
      style={{
        backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0,0,0,0.2)), url(${backgroundImageURL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Optional: Parchment texture overlay */}
      <div className="absolute inset-0 bg-[url('/assets/parchment-texture.jpg')] opacity-10 pointer-events-none"></div>

      {/* Gradient + darkness overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

      {/* Content */}
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
            {/* <p className="text-sm text-yellow-300 italic truncate">{admin || 'No Admin'}</p> */}
            <div className="flex mt-3 gap-2">
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
            </div>
          </>
        )}
      </div>
    </div>

  );
};

export default BoardCard;
