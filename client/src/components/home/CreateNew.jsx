import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createBoard } from '../../apis/boardApi';

// Import images
import defaultImg from '../../assets/templates/Dark.png';
import darkArtImg from '../../assets/templates/Dark.png';
import libraryImg from '../../assets/templates/Library.png';
import potionArtImg from '../../assets/templates/Potion.png';
import divinationImg from '../../assets/templates/Divination.png';
import herbologyImg from '../../assets/templates/Herbology.png';
import quidditchImg from '../../assets/templates/Quidditch.png';


const templates = [
  {
    id: null,
    name: 'Blank',
    image: defaultImg,
  },
  {
    id: '681682ee7b9b6705752a9600',
    name: 'Dark Arts',
    image: darkArtImg,
  },
  {
    id: '681682ee7b9b6705752a9600',
    name: 'Library',
    image: libraryImg,
  },
  {
    id: '681682ee7b9b6705752a9600',
    name: 'Potion Art',
    image: potionArtImg,
  },
  {
    id: '681682ee7b9b6705752a9600',
    name: 'Divination',
    image: divinationImg,
  },
  {
    id: '681682ee7b9b6705752a9600',
    name: 'Herbology',
    image: herbologyImg,
  },
  {
    id: '681682ee7b9b6705752a9600', // <-- Replace with your actual template ID
    name: 'Quidditch',
    image: quidditchImg,
  },
];


const CreateNew = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleTemplateSelect = async (templateId) => {
    try {
      const boardData = {
        firebaseUID: currentUser.user.uid,
        templateId: templateId || null,
      };

      const response = await createBoard(boardData);
      navigate(`/create/${response.boardId}`);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  return (
    <>
      <button
        className="h-[220px] w-[160px] rounded-xl bg-gradient-to-b from-[#2e1a47] to-[#1b102b] border-2 border-yellow-700 text-yellow-300 font-harry text-5xl flex flex-col items-center justify-center shadow-[0_0_25px_rgba(255,215,0,0.4)] hover:shadow-[0_0_35px_rgba(255,215,0,0.7)] transition-all duration-300 transform hover:scale-105"
        onClick={() => setShowTemplates(true)}
      >
        <p className="font-harry drop-shadow-[0_0_5px_gold]">+</p>
        <span className="text-sm mt-3 text-yellow-200 font-light tracking-widest italic">Create New</span>
      </button>

      {showTemplates && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-[#1b102b] rounded-xl p-6 w-[90%] max-w-4xl text-yellow-100">
            <h2 className="text-2xl font-bold mb-4 text-yellow-200">Choose a Template</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {templates.map((template) => (
                <div
                  key={template.name}
                  className="cursor-pointer border border-yellow-700 rounded-lg overflow-hidden hover:scale-105 transform transition duration-300 shadow-md"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2 text-center bg-[#2e1a47]">{template.name}</div>
                </div>
              ))}
            </div>
            <button
              className="mt-6 px-4 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-800 transition"
              onClick={() => setShowTemplates(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateNew;
