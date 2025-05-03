import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import Board from "./models/BoardModel.js";
import Message from "./models/MessageModel.js";
import User from "./models/UserModel.js";

dotenv.config();

// Initialize Express app
const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/messages", messageRoutes);

// Create HTTP server for Express
const httpServer = createServer(app);

// Start Express server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});

// Socket.IO Server
const socketServer = createServer();
const SOCKET_PORT = process.env.SOCKET_PORT || 3001;

const io = new Server(socketServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Start Socket.IO server
socketServer.listen(SOCKET_PORT, () => {
  console.log(`Socket.IO server running on port ${SOCKET_PORT}`);
});

// Socket.io Connection Handling
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Join a specific board room
  socket.on("joinBoard", (boardId) => {
    socket.join(boardId);
    console.log(`Socket ${socket.id} joined board room: ${boardId}`);
  });

  // Handle new chat messages
  socket.on("sendMessage", async (messageData) => {
    try {
      const { boardId, sender, text } = messageData;
      const firebaseUID = sender._id;
      
      if (!boardId || !firebaseUID || !text) {
        throw new Error("Invalid message data");
      }

      const user = await User.findOne({ firebaseUID });
      if (!user) throw new Error("User not found");

      const newMessage = new Message({
        boardId,
        sender: user._id,
        text,
      });

      const savedMessage = await newMessage.save();

      await Board.findByIdAndUpdate(
        boardId,
        { $push: { messages: savedMessage._id } },
        { new: true }
      );

      // Populate sender data before emitting
      const populatedMessage = await Message.findById(savedMessage._id)
        .populate('sender', 'name username avatar firebaseUID')
        .exec();

      io.to(boardId).emit("newMessage", {
        _id: populatedMessage._id,
        boardId: populatedMessage.boardId,
        sender: {
          _id: user._id,
          firebaseUID: user.firebaseUID,
          name: user.name,
          username: user.username,
          avatar: user.avatar
        },
        text: populatedMessage.text,
        timestamp: populatedMessage.createdAt,
      });

    } catch (error) {
      console.error("Send message error:", error);
      socket.emit("messageError", {
        error: "Failed to send message",
        details: error.message,
      });
    }
  });

  // Delete Message via Socket
  socket.on("deleteMessage", async ({ messageId, boardId }) => {
    try {
      if (!messageId || !boardId) {
        throw new Error("Message ID and Board ID are required");
      }

      // Optimistically emit deletion first
      io.to(boardId).emit("deletedMessage", messageId);

      // Then process DB deletion
      const message = await Message.findById(messageId);
      if (!message) throw new Error("Message not found");

      await Message.findByIdAndDelete(messageId);

      await Board.findByIdAndUpdate(boardId, {
        $pull: { messages: message._id },
      });

    } catch (error) {
      console.error("Delete message error:", error);
      socket.emit("messageError", {
        error: "Failed to delete message",
        details: error.message,
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});