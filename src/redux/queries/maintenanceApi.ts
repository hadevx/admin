import { api } from "./api";

export const maintenanceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateStoreStatus: builder.mutation({
      query: (data) => ({
        url: "/api/store",
        method: "PUT",
        body: data,
      }),
    }),
    getStoreStatus: builder.query({
      query: () => ({
        url: "/api/store",
      }),
    }),
  }),
});

export const { useUpdateStoreStatusMutation, useGetStoreStatusQuery } = maintenanceApi;
