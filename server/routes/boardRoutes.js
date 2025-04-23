import express from "express";
import { getBoards,createBoard ,getBoardDetails, getUsersInBoard, updateCanvasSize, shareBoardWithUser, updateBoardDetails} from "../controllers/boardController.js";

const router = express.Router();

// GET /api/boards/:uid?search=abc
router.get("/:uid", getBoards);
router.post("/create", createBoard); 
router.get('/:boardID', getBoardDetails);
router.put('/:boardID', updateBoardDetails);
router.get("/:boardID/users", getUsersInBoard);
router.put("/canvas/:boardID", updateCanvasSize);
router.post('/:boardId/share', shareBoardWithUser);

export default router;    