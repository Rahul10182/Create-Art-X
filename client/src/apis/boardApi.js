// apis/board.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

//get all boards for a user
export const getBoards = async (uid) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/boards/user/${uid}`);
    return res.data; 
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch boards");

  }
};
// Create a new board
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

// update board details
export const updateBoardTitle = async (boardID, title) => {
  const res = await axios.put(`${API_BASE_URL}/boards/${boardID}`, { title });
  return res.data;
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
// Update the canvas size of a board
export const updateCanvasSize = async (boardID, width, height) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/boards/canvas/${boardID}`, {
      width,
      height,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating canvas size:", error);
    throw error;
  }
};
// Share a board with a user
export const shareBoardWithUser = async (boardId, userId) => {
  try {
    console.log("Sharing board with user:", userId);
    const res = await axios.post(`${API_BASE_URL}/boards/${boardId}/share`, { userId });
    console.log("Board shared:", res.data);
  } catch (err) {
    console.error("Error sharing board:", err);
  }
};

// Save board shapes (auto-save feature)
// Client-side API request to save the board
export const saveBoardForUser = async (boardID, userId, shapes) => {
  try {
    console.log("boardID", boardID);
    console.log("userId", userId);
    console.log("shapes", shapes);
    
    // Sending both in the body of the request
    const response = await axios.post(`${API_BASE_URL}/boards/save`, {
      boardID,
      userId,
      shapes, // Send the shapes as part of the request body
    });

    return response.data;
  } catch (error) {
    console.error("Failed to save board for user:", error);
    throw error;
  }
};


export const getBoardForUser = async (boardID, userId) => {
  const res = await axios.post(`${API_BASE_URL}/boards/get`, {
    boardID,
    userId,
  });
  console.log("res", res);
  return res.data;
};



