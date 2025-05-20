import express from "express";
import { getBoards,createBoard ,getBoardDetails, getUsersInBoard, updateCanvasSize, shareBoardWithUser, updateBoardDetails, saveBoardForUser,getBoardForUser,createTemplate, deleteBoard} from "../controllers/boardController.js";

const router = express.Router();

// GET /api/boards/:uid?search=abc
router.post("/save", saveBoardForUser);
router.post("/get", getBoardForUser);
router.post("/create", createBoard); 

router.get("/user/:uid", getBoards);
router.get('/:boardID', getBoardDetails);
router.put('/:boardID', updateBoardDetails);
router.get("/:boardID/users", getUsersInBoard);
router.put("/canvas/:boardID", updateCanvasSize);
router.post('/:boardId/share', shareBoardWithUser);
router.post('/template/:boardId', createTemplate);
router.delete('/delete/:boardID', deleteBoard);


export default router;    