import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createBoard } from '../../apis/boardApi'; // MERN API call

const CreateNew = () => {
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.auth); 

    const handleCreateNew = async () => {
        if (!currentUser) {
        console.error("User is not authenticated");
        return;
        }

        try {
        // Call your backend to create a new board
        //console.log("Inside create new: ",currentUser.user.uid);
        const boardID = await createBoard(currentUser.user.uid); // Pass the Firebase UID to the API call
        navigate(`/create/${boardID}`);
        } catch (error) {
        console.error('Error creating board:', error);
        }
    };

  return (
    <button
      className="h-[220px] w-[160px] rounded-xl bg-gradient-to-b from-[#2e1a47] to-[#1b102b] border-2 border-yellow-700 text-yellow-300 font-harry text-5xl flex flex-col items-center justify-center shadow-[0_0_25px_rgba(255,215,0,0.4)] hover:shadow-[0_0_35px_rgba(255,215,0,0.7)] transition-all duration-300 transform hover:scale-105"
      onClick={handleCreateNew}
    >
      <p className="font-harry drop-shadow-[0_0_5px_gold]">+</p>
      <span className="text-sm mt-3 text-yellow-200 font-light tracking-widest italic">Create New</span>
    </button>

  );
};

export default CreateNew;
