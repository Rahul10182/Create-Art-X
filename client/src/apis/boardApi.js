// apis/board.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const getBoards = async (uid) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/boards/${uid}`);
    return res.data; // ✅ axios returns JSON by default
  } catch (err) {
    throw new Error("Failed to fetch boards");
  }
};


export const createBoard = async (firebaseUID) => {
  const response = await axios.post(`${API_BASE_URL}/boards/create", ${ firebaseUID }`);
  return response.data.boardId;
};

  
// Fetch board details based on the board ID
export const getBoardDetails = async (boardID) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/boards/${boardID}`);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error('Error fetching board details:', error);
    throw error;
  }
};
