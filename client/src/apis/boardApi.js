// apis/board.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const getBoards = async (uid, searchTerm = "") => {
    const res = await fetch(
      `${API_BASE_URL}/api/boards?uid=${uid}&search=${searchTerm}`
    );
    if (!res.ok) throw new Error("Failed to fetch boards");
    return res.json();
  };
  