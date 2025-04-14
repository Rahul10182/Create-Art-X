import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const checkUsernameAvailability = async (username) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/check-username/${username}`); // Pass username as a URL parameter
    console.log(response);
    return response.data.success; // Return true if available, false otherwise
  } catch (error) {
    console.error("Error checking username availability:", error.message);
    return false; // Default to false if there's an error
  }
};