import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * Sign up a new user
 * @param {Object} userData - { firebaseUID, name, regNo, email }
 */
export const signupUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/auth/signup`, userData);
    
    const firebaseUID = response.data?.firebaseUID;
    if (firebaseUID) {
      localStorage.setItem('firebaseUID', firebaseUID); // ✅ Save UID in localStorage
    }

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Signup failed");
  }
};

/**
 * Log in an existing user with firebaseUID in params
 * @param {string} firebaseUID - User's Firebase UID
 */
export const loginUser = async (firebaseUID) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/auth/login/${firebaseUID}`);
    
    if (firebaseUID) {
      localStorage.setItem('firebaseUID', firebaseUID); // ✅ Save UID in localStorage
    }

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};