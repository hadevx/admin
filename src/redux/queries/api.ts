import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  // baseUrl: "https://backend-wxs4.onrender.com",
  baseUrl: "http://localhost:4001",
  // baseUrl: "https://backend-production-9357.up.railway.app",
  credentials: "include",
});

export const api = createApi({
  baseQuery,
  tagTypes: ["Product", "Order", "User", "Status", "Category"],

  endpoints: () => ({}),
});
