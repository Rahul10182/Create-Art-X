import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const signupUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/auth/signup`, userData);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Signup failed");
  }
};


export const loginUser = async (firebaseUID) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/auth/login/${firebaseUID}`);
    console.log(response);
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};