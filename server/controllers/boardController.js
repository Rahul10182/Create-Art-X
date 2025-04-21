// controllers/boardController.js
import Board from "../models/BoardModel.js";
import User from "../models/UserModel.js";

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