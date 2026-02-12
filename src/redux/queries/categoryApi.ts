import { api } from "./api";

export const categoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (category) => ({
        url: "/api/category",
        method: "POST",
        body: category,
      }),
    }),

    getCategories: builder.query({
      query: ({ pageNumber = 1, keyword = "" }) => ({
        url: `/api/category?pageNumber=${pageNumber}&keyword=${keyword}`,
      }),
    }),

    getAllCategories: builder.query({
      query: () => ({
        url: `/api/category/all`,
      }),
    }),
    getCategoriesTree: builder.query({
      query: () => ({
        url: "/api/category/tree",
      }),
    }),

    deleteCategory: builder.mutation({
      query: (category) => ({
        url: "/api/category",
        method: "DELETE",
        body: category,
      }),
    }),

    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/category/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    uploadCategoryImage: builder.mutation({
      query: (data) => ({
        url: "/api/upload/category",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useGetCategoriesTreeQuery,
  useUpdateCategoryMutation,
  useGetAllCategoriesQuery,
  useUploadCategoryImageMutation,
} = categoryApi;
