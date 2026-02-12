import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

const rawBaseQuery = fetchBaseQuery({
  // baseUrl: "http://localhost:4001",
  baseUrl: "https://backend.webschema.online",
  credentials: "include",
});

const baseQueryWithForbiddenRedirect: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 403) {
    // user is authenticated but not allowed
    const from = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/forbidden?from=${from}`;
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithForbiddenRedirect,
  tagTypes: ["Product", "Order", "User", "Status", "Category", "Coupon", "Delivery"],
  endpoints: () => ({}),
});
