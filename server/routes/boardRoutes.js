import express from "express";
import { getBoards } from "../controllers/boardController.js";

const router = express.Router();

// GET /api/boards/:uid?search=abc
router.get("/:uid", getBoards);

export default router;