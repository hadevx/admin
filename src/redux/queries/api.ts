import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  // baseUrl: "https://backend-wxs4.onrender.com",
  // baseUrl: "http://localhost:4001",
  // baseUrl: "https://backend-production-9357.up.railway.app",
  // baseUrl: "http://ccoscggg08ksscggssc404sg.137.184.90.203.sslip.io",
  baseUrl: "https://backend.webschema.online",
  credentials: "include",
});

export const api = createApi({
  baseQuery,
  tagTypes: ["Product", "Order", "User", "Status", "Category"],

  endpoints: () => ({}),
});
