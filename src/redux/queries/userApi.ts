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
      query: () => ({
        url: "/api/users",
      }),
    }),
    getAddress: builder.query({
      query: (userId: any) => ({
        url: `/api/users/address/${userId}`,
      }),
    }),
    getUserDetails: builder.query({
      query: (userId: any) => ({
        url: `/api/users/${userId}`,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `/api/users/logout`,
        method: "POST",
      }),
    }),
    deleteUser: builder.mutation({
      query: (userId: any) => ({
        url: `/api/users/${userId}`,
        method: "DELETE",
      }),
    }),
    updateUser: builder.mutation({
      query: (data: any) => ({
        url: `/api/users/${data.userId}`,
        method: "PUT",
        body: data,
      }),
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
} = userApi;
