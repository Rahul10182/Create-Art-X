// apis/messageApi.js
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getMessages = async (boardId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/messages/${boardId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch messages';
    console.error('Error fetching messages:', message);
    throw new Error(message);
  }
};
