import express from "express";
import { getBoards,createBoard ,getBoardDetails} from "../controllers/boardController.js";

const router = express.Router();

// GET /api/boards/:uid?search=abc
router.get("/:uid", getBoards);
router.post("/create", createBoard); 
router.get('/:boardID', getBoardDetails);

export default router;