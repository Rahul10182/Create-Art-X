import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: Object, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  canvas: {
    size: {
      width: { type: Number, default: 800 },
      height: { type: Number, default: 600 },
    }
  },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]  
});


const Board = mongoose.model("Board", boardSchema);
export default Board;
