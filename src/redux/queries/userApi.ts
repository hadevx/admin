import { api } from "./api.ts";

const userApi = api.injectEndpoints({
  endpoints: (builder: any) => ({
    loginUser: builder.mutation({
      query: (data: any) => ({
        url: "/api/users/admin",
        method: "POST",
        body: data,
      }),
    }),
    getUsers: builder.query({
      query: ({ pageNumber = 1, keyword = "" }) => ({
        // encodeURIComponent: an unescaped "&" or "#" in the search box used to
        // truncate the query string and silently return unfiltered results.
        url: `/api/users?pageNumber=${pageNumber}&keyword=${encodeURIComponent(keyword)}`,
      }),
      providesTags: ["User"],
    }),

    getAddress: builder.query({
      query: (userId: any) => ({
        url: `/api/users/address/${userId}`,
      }),
      providesTags: ["User"],
    }),
    getUserDetails: builder.query({
      query: (userId: any) => ({
        url: `/api/users/${userId}`,
      }),
      providesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: `/api/users/admin/logout`,
        method: "POST",
      }),
    }),
    deleteUser: builder.mutation({
      query: (userId: any) => ({
        url: `/api/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: (data: any) => ({
        url: `/api/users/${data.userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    // `blockReason` is optional and only meaningful when this call blocks the
    // user; the server clears it on unblock.
    toggleBlockUser: builder.mutation({
      query: (data: any) => ({
        url: `/api/users/${data.userId}/block`,
        method: "PUT",
        body: { blockReason: data.blockReason ?? "" },
      }),
      invalidatesTags: ["User"],
    }),
    toggleVIPUser: builder.mutation({
      query: (data: any) => ({
        url: `/api/users/${data.userId}/vip`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    getGovernorate: builder.query({
      query: () => ({
        url: `/api/users/governorates`,
      }),
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginUserMutation,
  useGetAddressQuery,
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useLogoutMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useGetGovernorateQuery,
  useToggleBlockUserMutation,
  useToggleVIPUserMutation,
} = userApi;
