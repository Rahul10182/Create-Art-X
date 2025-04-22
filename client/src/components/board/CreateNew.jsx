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
      className="h-[200px] w-[150px] rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-5xl font-semibold text-white flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200"
      onClick={handleCreateNew}
    >
      <p className="font-medium">+</p>
      <span className="text-sm text-gray-100 font-light mt-2">Create New Canvas</span>
    </button>
  );
};

export default CreateNew;
