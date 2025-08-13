import { configureStore } from "@reduxjs/toolkit";
import { api } from "./queries/api";

import authSliceReducer from "./slices/authSlice";

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authSliceReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  devTools: true,
});

export default store;
