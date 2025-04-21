import User from "../models/UserModel.js";

/**
 * Add a new user to the database after Firebase Signup
 * Expected Request Body: { firebaseUID, name, username, email }
 */
export const addUser = async (req, res) => {
  try {
    const userData = req.body;
    const { firebaseUID, name, username, email } = userData;

    if (!firebaseUID || !name || !username || !email) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if username is already taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }

    // Check if user already exists (via Firebase UID)
    let user = await User.findOne({ firebaseUID });

    if (!user) {
      user = new User({ firebaseUID, name, username, email });
      await user.save();
    } else {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    res.status(200).json({ success: true, message: "User added successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding user", error: error.message });
  }
};

/**
 * Fetch user by Firebase UID
 */
export const getUserByUID = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ firebaseUID: uid.trim() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user", error: error.message });
  }
};

/**
 * Update User - Allows updating only name, username & avatar
 * Expected Request Body: { name, username, avatar }
 */
export const updateUser = async (req, res) => {
  try {
    const { firebaseUID } = req.params;
    const { name, username, avatar } = req.body;

    if (!firebaseUID) {
      return res.status(400).json({ success: false, message: "Firebase UID is required" });
    }

    const user = await User.findOne({ firebaseUID });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If updating username, check if it's already taken
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ success: false, message: "Username already taken" });
      }
      user.username = username;
    }

    user.name = name || user.name;
    user.avatar = avatar || user.avatar;
    await user.save();

    res.status(200).json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating user", error: error.message });
  }
};

/**
 * Get All Users
 */
export const getAllUsers = async (req, res) => {    
  try {
    const users = await User.find();
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users", error: error.message });
  }
};

/**
 * Check if username is available
 */

export const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.params; // Extract username from params

    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(200).json({ success: false, message: "Username is taken" });
    }

    res.status(200).json({ success: true, message: "Username is available" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error checking username", error: error.message });
  }
};