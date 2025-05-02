// controllers/boardController.js
import Board from "../models/BoardModel.js";
import User from "../models/UserModel.js";
import cloudinary from "../config/cloudinary.js";

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
  const { boardID, userId, shapes } = req.body;
  // console.log("boardID", boardID);
  // console.log("userId", userId);
  // console.log("shapes", shapes);

  try {
    const board = await Board.findById(boardID);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const user = await User.findOne({ firebaseUID: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!board.sharedWith.some(id => id.toString() === user._id.toString())) {
      board.sharedWith.push(user._id);
    }

    if (!user.boards.some(id => id.toString() === boardID)) {
      user.boards.push(boardID);
    }

    const uploadedImages = [];
    const filteredShapes = [];

    await Promise.all(
      shapes.map(async (shape) => {
        if (shape.type === "image" && shape.src?.startsWith("data:image")) {
          try {
            const result = await cloudinary.uploader.upload(shape.src, {
              folder: "board-images",
              tags: [boardID, userId], // Important for search
              context: {
                boardID,
                userID: userId,
                shapeID: shape.id
              }
            });

            uploadedImages.push({
              id: shape.id,
              url: result.secure_url,
              public_id: result.public_id,
              x: shape.x,
              y: shape.y,
              width: shape.width,
              height: shape.height,
            });

            // Optionally store a reference to the cloudinary public_id in the shape
            filteredShapes.push({
              ...shape,
              cloudinaryPublicId: result.public_id
            });
          } catch (err) {
            console.error("Cloudinary upload failed:", err);
          }
        } else {
          filteredShapes.push(shape); // Keep non-image shapes
        }
      })
    );

    board.shapes = filteredShapes;
    await board.save();
    await user.save();

    res.status(200).json({
      message: "Board saved. Images uploaded to Cloudinary.",
      board,
      uploadedImages,
    });
  } catch (error) {
    console.error("Error saving board:", error);
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
        { sharedWith: user._id }
      ]
    })
    .populate('createdBy', 'name email')
    .populate('sharedWith', 'name email');

    if (!board) {
      return res.status(404).json({ message: 'Board not found or access denied' });
    }

    // Fetch relevant images from Cloudinary using tags
    const cloudinaryResult = await cloudinary.search
      .expression(`tags:${boardID} AND tags:${userId}`)
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();

    const cloudinaryImages = cloudinaryResult.resources.map(img => ({
      public_id: img.public_id,
      url: img.secure_url,
      format: img.format,
      width: img.width,
      height: img.height,
      created_at: img.created_at
    }));

    // Update shapes with Cloudinary URLs if match by public_id
    const updatedShapes = board.shapes.map(shape => {
      if (shape.type === 'image' && shape.cloudinaryPublicId) {
        const matchingImg = cloudinaryImages.find(img => img.public_id === shape.cloudinaryPublicId);
        if (matchingImg) {
          return {
            ...shape,
            src: matchingImg.url
          };
        }
      }
      return shape;
    });

    const boardWithUpdatedShapes = {
      ...board.toObject(),
      shapes: updatedShapes,
      cloudinaryImages
    };

    res.status(200).json(boardWithUpdatedShapes);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
