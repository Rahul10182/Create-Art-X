import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: Object, default: {} }, 
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

const Board = mongoose.model("Board", boardSchema);
export default Board;
