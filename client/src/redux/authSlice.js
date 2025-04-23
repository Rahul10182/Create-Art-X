import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user:  null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      console.log("Login dispatched with payload:", action.payload); // ✅ check this
      state.user = action.payload;
    },
    logout: (state) => {
      console.log("Login dispatched with payload:",state); // ✅ check this
      state.user = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
