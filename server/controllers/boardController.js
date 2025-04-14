// controllers/boardController.js
import Board from "../models/BoardModel.js";
import User from "../models/UserModel.js";

export const getBoards = async (req, res) => {
  const { uid } = req.params;
  const search = req.query.search || "";

  try {
    const user = await User.findOne({ firebaseUID: uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch all boards the user owns
    const boards = await Board.find({
      _id: { $in: user.boards },
      title: { $regex: search, $options: "i" }, // case-insensitive search
    });

    res.status(200).json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    res.status(500).json({ message: "Server error" });
  }
};
