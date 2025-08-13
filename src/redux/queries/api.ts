import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://backend-wxs4.onrender.com",
  credentials: "include",
});

export const api = createApi({
  baseQuery,
  tagTypes: ["Product", "Order", "User", "Status", "Category"],

  endpoints: () => ({}),
});
