import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
  board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
});

const Template = mongoose.model("Template", templateSchema);
export default Template;
