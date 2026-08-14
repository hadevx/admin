import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

/**
 * Base URL comes from the environment so a production build can never ship
 * pointing at a developer's localhost. Set VITE_API_URL in `.env` (local) and
 * in the deploy environment; the fallback is the hosted API.
 */
const API_URL = import.meta.env.VITE_API_URL?.trim() || "https://backend.webschema.online";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
});

/** Wipe the local session and bounce to login. */
const endSession = () => {
  localStorage.removeItem("adminUserInfo");
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
};

/**
 * Endpoints where a 401/403 is an *answer*, not a broken session: wrong
 * password, or an account the server has blocked. Redirecting away from these
 * would replace the explanation with a generic error screen.
 */
const isAuthEndpoint = (args: string | FetchArgs) => {
  const url = typeof args === "string" ? args : args.url;
  return url.startsWith("/api/users/admin") || url.startsWith("/api/users/login");
};

const baseQueryWithAuthHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (isAuthEndpoint(args)) {
    return result;
  }

  // 401: the admin cookie is missing or expired (tokens last 2 days). Without
  // this the stored adminUserInfo keeps the UI "logged in" while every request
  // fails, which looks like the dashboard is broken.
  if (result.error?.status === 401) {
    endSession();
  }

  if (result.error?.status === 403) {
    // Authenticated, but not allowed here.
    const from = encodeURIComponent(window.location.pathname + window.location.search);
    if (!window.location.pathname.startsWith("/forbidden")) {
      window.location.href = `/forbidden?from=${from}`;
    }
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: ["Product", "Order", "User", "Status", "Category", "Coupon", "Delivery", "Discount"],
  endpoints: () => ({}),
});
