// src/redux/slices/themeSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_SKIN, isSkin, type Skin } from "@/lib/themes";

export type Theme = "light" | "dark";

export const THEME_KEY = "theme";
export const SKIN_KEY = "admin:skin";

/**
 * Two independent axes:
 *  - `theme` is the light/dark mode, toggled from the top bar.
 *  - `skin`  is the colour scheme, chosen in Settings. Every skin defines both
 *    a light and a dark palette, so changing one never resets the other.
 */
const storedSkin = typeof localStorage !== "undefined" ? localStorage.getItem(SKIN_KEY) : null;

const initialState: { theme: Theme; skin: Skin } = {
  theme: (localStorage.getItem(THEME_KEY) as Theme) || "light",
  skin: isSkin(storedSkin) ? storedSkin : DEFAULT_SKIN,
};

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

const applySkin = (skin: Skin) => {
  document.documentElement.dataset.skin = skin;
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, state.theme);
      applyTheme(state.theme);
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      localStorage.setItem(THEME_KEY, state.theme);
      applyTheme(state.theme);
    },
    setSkin: (state, action: PayloadAction<Skin>) => {
      state.skin = action.payload;
      localStorage.setItem(SKIN_KEY, state.skin);
      applySkin(state.skin);
    },
  },
});

export const { toggleTheme, setTheme, setSkin } = themeSlice.actions;
export default themeSlice.reducer;
