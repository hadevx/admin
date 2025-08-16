import { createSlice } from "@reduxjs/toolkit";

const savedData = localStorage.getItem("adminUserInfo");
const initialState = {
  userInfo: savedData ? JSON.parse(savedData) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem("adminUserInfo", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem("adminUserInfo");
    },
  },
});

export const { setUserInfo, logout } = authSlice.actions;
export default authSlice.reducer;
