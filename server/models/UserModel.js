import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true }, 
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
});

const User = mongoose.model("User", userSchema);
export default User;