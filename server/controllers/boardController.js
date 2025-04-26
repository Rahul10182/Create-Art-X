// controllers/boardController.js
import Board from "../models/BoardModel.js";
import User from "../models/UserModel.js";

export const updateCanvasSize = async (req, res) => {
  const { boardID } = req.params;
  const { width, height } = req.body;

  try {
    const board = await Board.findById(boardID);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    board.canvas = { ...board.canvas, size: { width, height } };
    await board.save();

    res.status(200).json({ message: "Canvas size updated successfully" });
  } catch (error) {
    console.error("Error updating canvas size:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBoards = async (req, res) => {
  const { uid } = req.params;

  try {
    const user = await User.findOne({ firebaseUID: uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch all boards the user owns without search filtering
    const boards = await Board.find({
      _id: { $in: user.boards }
    });

    res.status(200).json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const createBoard = async (req, res) => {
  const { firebaseUID } = req.body;

  try {
    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ error: "User not found" });

    const board = new Board({
      title: "Untitled Canvas",
      createdBy: user._id,
      content: {}
    });

    await board.save();

    user.boards.push(board._id);
    await user.save();

    res.status(201).json({ boardId: board._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create board" });
  }
};

//get board details
export const getBoardDetails = async (req, res) => {
  const { boardID } = req.params;

  try {
    // Fetch board by ID
    const board = await Board.findById(boardID).populate('createdBy', 'name'); // Populate the 'createdBy' field to get admin's name
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Return board details along with admin's name
    res.status(200).json({
      title: board.title,
      admin: board.createdBy ? board.createdBy.name : 'Unknown', // Check if createdBy is populated
    });
  } catch (error) {
    console.error('Error fetching board details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
//update board details
export const updateBoardDetails = async (req, res) => {
  const { boardID } = req.params;
  const { title } = req.body;

  try {
    // Find the board by ID
    const board = await Board.findById(boardID);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Update the board title
    board.title = title;
    await board.save();

    res.status(200).json({ message: "Board updated successfully", board });
  } catch (error) {
    console.error("Error updating board:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Fetch users associated with a specific board
export const getUsersInBoard = async (req, res) => {
  const { boardID } = req.params;

  try {
    // Find users where `boards` array contains the boardID
    const users = await User.find({ boards: boardID }).select("name");

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found for this board" });
    }

    const userNames = users.map((user) => user.name);
    res.status(200).json({ users: userNames });
  } catch (error) {
    console.error("Error fetching users for board:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//share board with user
export const shareBoardWithUser = async (req, res) => {
  const { boardId } = req.params;
  const { userId } = req.body;
  console.log("boardID", boardId);
  console.log("userId", userId);

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });

    // Avoid duplicate sharing
    if (!board.sharedWith.includes(userId)) {
      board.sharedWith.push(userId);
      await board.save();
    }

    if(!user.boards.includes(boardId)) {
      user.boards.push(boardId);
      await user.save();
    }

    res.status(200).json({ message: "Board shared successfully", board });
  } catch (error) {
    console.error("Error sharing board:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Backend API handler to save the board for a user
export const saveBoardForUser = async (req, res) => {
  const { boardID, userId, shapes } = req.body; // Receive shapes from the request body

  console.log("Firebase UID:", userId);
  console.log("boardId:", boardID);

  try {
    // Find the board by its ID
    const board = await Board.findById(boardID);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Find the user by their Firebase UID
    const user = await User.findOne({ firebaseUID: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add user to the board.sharedWith if not already present
    if (!board.sharedWith.some(id => id.toString() === user._id.toString())) {
      board.sharedWith.push(user._id);
      await board.save();
    }

    // Add board to the user's boards list if not already present
    if (!user.boards.some(id => id.toString() === boardID)) {
      user.boards.push(boardID);
      await user.save();
    }

    // Save the shapes to the board (assuming you want to store the drawing state in the board)
    board.shapes = shapes; // This could be a new field that stores the shapes
    await board.save();

    res.status(200).json({ message: "Board associated with user and shapes saved successfully" });
  } catch (error) {
    console.error("Error associating board with user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getBoardForUser = async (req, res) => {
  const { boardID, userId } = req.body;


  try {
    const user = await User.findOne({ firebaseUID: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const board = await Board.findOne({
      _id: boardID,
      $or: [
        { createdBy: user._id },
        { sharedWith: user._id } // 🔁 changed from members to sharedWith
      ]
    })
      .populate('createdBy', 'name email')
      .populate('sharedWith', 'name email'); // 🔁 changed from members to sharedWith

    if (!board) {
      return res.status(404).json({ message: 'Board not found or access denied' });
    }

    res.status(200).json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
