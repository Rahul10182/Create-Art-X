import express from "express";
import { addUser, getUserByUID, updateUser, getAllUsers , checkUsernameAvailability} from "../controllers/userController.js";

const router = express.Router();

router.post("/auth/signup", addUser);      // Route to add a new user
router.get("/auth/login/:uid", getUserByUID); // Route to get user by Firebase UID
router.put("/:firebaseUID", updateUser); // Route to update user by Firebase UID
router.get("/", getAllUsers); // Route to get all users
router.get("/check-username/:username", checkUsernameAvailability); // Route to check username availability

export default router;