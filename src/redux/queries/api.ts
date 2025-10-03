import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  // baseUrl: "http://localhost:4001",
  baseUrl: "https://backend.webschema.online",
  credentials: "include",
});

export const api = createApi({
  baseQuery,
  tagTypes: ["Product", "Order", "User", "Status", "Category"],

  endpoints: () => ({}),
});
