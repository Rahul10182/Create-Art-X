// apis/board.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const getBoards = async (uid) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/boards/${uid}`);
    return res.data; 
  } catch (err) {
    throw new Error("Failed to fetch boards");
  }
};


export const createBoard = async (firebaseUID) => {
  const response = await axios.post(`${API_BASE_URL}/boards/create`, { firebaseUID } );
  return response.data.boardId;
};

  
// Fetch board details based on the board ID
export const getBoardDetails = async (boardID) => {
  try {
    console.log(boardID);
    const response = await axios.get(`${API_BASE_URL}/boards/${boardID}`);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error('Error fetching board details:', error);
    throw error;
  }
};

// Fetch users in a specific board
export const getBoardUsers = async (boardID) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/boards/${boardID}/users`);
    console.log(res);
    return res.data.users; // returns array of user names
  } catch (err) {
    console.error("Failed to fetch board users:", err);
    return [];
  }
};
