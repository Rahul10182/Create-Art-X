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
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
// to increase the payload limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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
    credentials: true,
  },
});

// Start Socket.IO server
socketServer.listen(SOCKET_PORT, () => {
  console.log(`Socket.IO server running on port ${SOCKET_PORT}`);
});

// Initialize drawing boards storage
const drawingBoards = new Map();

// Error logging utility
const logError = (error, context = '') => {
  console.error(`[ERROR] ${context}:`, error);
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    console.error('Response headers:', error.response.headers);
  } else if (error.request) {
    console.error('Request:', error.request);
  } else {
    console.error('Error message:', error.message);
  }
  console.error('Stack trace:', error.stack);
};

// Socket.io Connection Handling
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  const handleSocketError = (error, eventName) => {
    logError(error, `Socket event ${eventName}`);
    socket.emit('socketError', {
      event: eventName,
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
    });
  };

  // Join a specific board room and initialize board data
  socket.on("joinBoard", (boardId) => {
    try {
      if (!drawingBoards.has(boardId)) {
        drawingBoards.set(boardId, {
          shapes: [],
          users: new Set([socket.id])
        });
      } else {
        drawingBoards.get(boardId).users.add(socket.id);
      }
      
      socket.join(boardId);
      console.log(`Socket ${socket.id} joined board room: ${boardId}`);
      
      // Send existing shapes to the new client
      const board = drawingBoards.get(boardId);
      socket.emit('initialShapes', board.shapes);
    } catch (error) {
      handleSocketError(error, 'joinBoard');
    }
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
        .populate("sender", "name username avatar firebaseUID")
        .exec();

      io.to(boardId).emit("newMessage", {
        _id: populatedMessage._id,
        boardId: populatedMessage.boardId,
        sender: {
          _id: user._id,
          firebaseUID: user.firebaseUID,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
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

  // Drawing Board Events
  socket.on("addShape", ({ boardId, shape }) => {
    try {
      if (!boardId || !shape || !shape.id) {
        throw new Error('Invalid shape data');
      }

      console.log(`Adding shape ${shape.id} to board ${boardId}`);
      
      // Initialize board if it doesn't exist
      if (!drawingBoards.has(boardId)) {
        drawingBoards.set(boardId, {
          shapes: [],
          users: new Set()
        });
      }

      const board = drawingBoards.get(boardId);
      board.shapes.push(shape);
      socket.to(boardId).emit("addShape", shape);
    } catch (error) {
      handleSocketError(error, 'addShape');
    }
  });

  socket.on("updateShape", ({ boardId, shapeId, updates }) => {
    try {
      if (!boardId || !shapeId || !updates) {
        throw new Error('Missing required parameters');
      }

      console.log(`Updating shape ${shapeId} on board ${boardId}`);
      const board = drawingBoards.get(boardId);
      if (!board) {
        throw new Error(`Board ${boardId} not found`);
      }

      const shape = board.shapes.find(s => s.id === shapeId);
      if (!shape) {
        throw new Error(`Shape ${shapeId} not found`);
      }

      Object.assign(shape, updates);
      socket.to(boardId).emit("shapeUpdated", { shapeId, updates });
    } catch (error) {
      handleSocketError(error, 'updateShape');
    }
  });

  socket.on("deleteShape", ({ boardId, shapeId }) => {
    try {
      if (!boardId || !shapeId) {
        throw new Error('Missing required parameters');
      }

      console.log(`Deleting shape ${shapeId} from board ${boardId}`);
      const board = drawingBoards.get(boardId);
      if (!board) {
        throw new Error(`Board ${boardId} not found`);
      }

      board.shapes = board.shapes.filter(s => s.id !== shapeId);
      socket.to(boardId).emit("shapeDeleted", shapeId);
    } catch (error) {
      handleSocketError(error, 'deleteShape');
    }
  });

  // Handle clear board
  socket.on("clearBoard", (boardId) => {
    try {
      if (!boardId) {
        throw new Error('Board ID is required');
      }

      console.log(`Clearing board ${boardId}`);
      const board = drawingBoards.get(boardId);
      if (!board) {
        throw new Error(`Board ${boardId} not found`);
      }

      board.shapes = [];
      socket.to(boardId).emit("boardCleared");
    } catch (error) {
      handleSocketError(error, 'clearBoard');
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Remove user from all boards they joined
    drawingBoards.forEach((board, boardId) => {
      if (board.users.has(socket.id)) {
        board.users.delete(socket.id);
        if (board.users.size === 0) {
          // Optionally: remove board if no users left
          drawingBoards.delete(boardId);
        }
      }
    });
  });
});