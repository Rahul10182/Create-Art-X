import express from "express";
import { saveMessage, getBoardMessages, deleteMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", saveMessage);

// Get messages for a board
router.get("/:boardId", getBoardMessages);
router.delete("/:messageId", deleteMessage);

export default router;