import { api } from "./api";

export const orderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: ({ pageNumber = 1, keyword = "" }) => ({
        // encodeURIComponent: an unescaped "&" or "#" in the search box used to
        // truncate the query string and silently return unfiltered results.
        url: `/api/orders?pageNumber=${pageNumber}&keyword=${encodeURIComponent(keyword)}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Order"], // this query "provides" the Order cache
    }),
    getOrder: builder.query({
      query: (orderId) => ({
        url: `/api/orders/admin/${orderId}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Order"],
    }),
    getUserOrders: builder.query({
      query: (userId) => ({
        url: `/api/orders/user-orders/${userId}`,
      }),
      providesTags: ["Order"],
    }),
    updateOrderToDeliverd: builder.mutation({
      query: (orderId) => ({
        url: `/api/orders/${orderId}/deliver`,
        method: "PUT",
      }),
      invalidatesTags: ["Order"],
    }),
    // `cancelReason` is optional — the server stores "" when it's omitted.
    updateOrderToCanceled: builder.mutation<any, { orderId: string; cancelReason?: string }>({
      query: ({ orderId, cancelReason }) => ({
        url: `/api/orders/${orderId}/cancel`,
        method: "PUT",
        body: { cancelReason: cancelReason ?? "" },
      }),
      invalidatesTags: ["Order"],
    }),
    // Tagged so the dashboard totals refresh after an order is delivered or
    // canceled instead of showing stale numbers.
    getOrderStats: builder.query({
      query: () => ({
        url: `/api/orders/stats`,
      }),
      providesTags: ["Order"],
    }),
    getRevenuStats: builder.query({
      query: () => ({
        url: `/api/orders/revenu`,
      }),
      providesTags: ["Order"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetUserOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderToDeliverdMutation,
  useUpdateOrderToCanceledMutation,
  useGetOrderStatsQuery,
  useGetRevenuStatsQuery,
} = orderApi;
