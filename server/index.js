import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";

dotenv.config();
const app = express();        

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/boards", boardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));