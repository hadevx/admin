import { configureStore } from "@reduxjs/toolkit";
import { api } from "./queries/api";

import languageReducer from "./slices/languageSlice";
import authSliceReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authSliceReducer,
    language: languageReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
