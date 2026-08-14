import { api } from "./api";

export const categoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (category) => ({
        url: "/api/category",
        method: "POST",
        body: category,
      }),
      invalidatesTags: ["Category", "Product"],
    }),

    getCategories: builder.query({
      query: ({ pageNumber = 1, keyword = "" }) => ({
        // encodeURIComponent: an unescaped "&" or "#" in the search box used to
        // truncate the query string and silently return unfiltered results.
        url: `/api/category?pageNumber=${pageNumber}&keyword=${encodeURIComponent(keyword)}`,
      }),
      providesTags: ["Category"],
    }),

    getAllCategories: builder.query({
      query: () => ({
        url: `/api/category/all`,
      }),
      providesTags: ["Category"],
    }),
    getCategoriesTree: builder.query({
      query: () => ({
        url: "/api/category/tree",
      }),
      providesTags: ["Category"],
    }),

    // Deletes by id. Names are only unique per parent, so the old name-based
    // delete could remove the wrong category when two shared a name.
    deleteCategory: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/api/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category", "Product"],
    }),

    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/category/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category", "Product"],
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
