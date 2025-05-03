import Message from "../models/MessageModel.js";
import Board from "../models/BoardModel.js";
import User from "../models/UserModel.js";

// Save message to database
export const saveMessage = async (req, res) => {
  try {
    const { boardId, firebaseUID, text } = req.body;

    const user = await User.findOne({ firebaseUID: firebaseUID });
    const sender = user._id;
    
    // Create new message
    const newMessage = new Message({
      boardId,
      sender,
      text
    });

    // Save message
    const savedMessage = await newMessage.save();

    // Add message reference to board
    await Board.findByIdAndUpdate(
      boardId,
      { $push: { messages: savedMessage._id } },
      { new: true }
    );

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all messages for a board
export const getBoardMessages = async (req, res) => {
  try {
    const { boardId } = req.params;
    
    const messages = await Message.find({ boardId })
      .populate("sender", "name username email avatar")
      .sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required" });
    }
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    await Message.findByIdAndDelete(message._id);

    await Board.findByIdAndUpdate(message.boardId, {
      $pull: { messages: message._id },
    });

    res.status(200).json({ success: true, id: message._id });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
};