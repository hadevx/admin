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
    /*  getUsers: builder.query({
      query: () => ({
        url: "/api/users",
      }),
    }), */
    getUsers: builder.query({
      query: ({ pageNumber = 1, keyword = "" }) => ({
        url: `/api/users?pageNumber=${pageNumber}&keyword=${keyword}`,
      }),
      providesTags: (result: any) =>
        result
          ? [
              // individual user tags
              ...result.users.map(({ _id }: any) => ({ type: "User" as const, id: _id })),
              // list tag
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
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
        url: `/api/users/admin/logout`,
        method: "POST",
      }),
    }),
    deleteUser: builder.mutation({
      query: (userId: any) => ({
        url: `/api/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    updateUser: builder.mutation({
      query: (data: any) => ({
        url: `/api/users/${data.userId}`,
        method: "PUT",
        body: data,
      }),
    }),
    getGovernorate: builder.query({
      query: () => ({
        url: `/api/users/governorates`,
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
  useGetGovernorateQuery,
} = userApi;
