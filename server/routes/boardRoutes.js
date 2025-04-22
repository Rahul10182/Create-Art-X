import express from "express";
import { getBoards,createBoard ,getBoardDetails, getUsersInBoard} from "../controllers/boardController.js";

const router = express.Router();

// GET /api/boards/:uid?search=abc
router.get("/:uid", getBoards);
router.post("/create", createBoard); 
router.get('/:boardID', getBoardDetails);
router.get("/:boardID/users", getUsersInBoard);

export default router;    