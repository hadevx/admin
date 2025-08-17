import { api } from "./api";

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /*     getProducts: builder.query({
      query: () => ({
        url: "/api/products",
      }),
    }), */
    getProducts: builder.query({
      query: ({ pageNumber = 1, keyword = "" }) => ({
        url: `/api/products?pageNumber=${pageNumber}&keyword=${keyword}`,
      }),
      providesTags: ["Product"],
    }),
    getProductById: builder.query({
      query: (productId) => ({
        url: `/api/products/product/${productId}`,
      }),
    }),
    getProductsByCategory: builder.query({
      query: (category) => ({
        url: `/api/products/category/${category}`,
      }),
    }),
    updateStock: builder.mutation({
      query: (orderItems) => ({
        url: "/api/products/update-stock",
        method: "POST",
        body: orderItems,
      }),
    }),
    getDeliveryStatus: builder.query({
      query: () => ({
        url: `/api/products/delivery`,
      }),
    }),
    createDiscount: builder.mutation({
      query: (data) => ({
        url: `/api/products/discount`,
        method: "POST",
        body: data,
      }),
    }),
    deleteDiscount: builder.mutation({
      query: (data) => ({
        url: `/api/products/discount`,
        method: "DELETE",
        body: data,
      }),
    }),
    updateDiscount: builder.mutation({
      query: (data) => ({
        url: `/api/products/discount`,
        method: "PUT",
        body: data,
      }),
    }),
    getDiscountStatus: builder.query({
      query: () => ({
        url: `/api/products/discount`,
      }),
    }),
    /*    createProduct: builder.mutation({
      query: (data) => ({
        url: "/api/products",
        method: "POST",
        body: data,
      }),
    }), */
    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: "/api/upload",
        method: "POST",
        body: data,
      }),
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: `/api/products`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `/api/products/${productId}`,
        method: "DELETE",
      }),
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: `/api/products/${data._id}`,
        method: "PUT",
        body: data,
      }),
      // invalidatesTags: ["Products"],
    }),
    deleteImage: builder.mutation({
      query: (data) => ({
        url: `/api/products/delete-image`,
        method: "POST",
        body: data,
      }),
    }),
    getLatestProducts: builder.query({
      query: () => ({
        url: "/api/products/latest",
      }),
    }),
    createCategory: builder.mutation({
      query: (category) => ({
        url: "/api/category",
        method: "POST",
        body: category,
      }),
    }),
    getCategories: builder.query({
      query: () => ({
        url: "/api/category",
      }),
    }),
    getCategoriesTree: builder.query({
      query: () => ({
        url: "/api/category/tree",
      }),
    }),
    deleteCategory: builder.mutation({
      query: (category) => ({
        url: "/api/products/category",
        method: "DELETE",
        body: category,
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductsByCategoryQuery,
  useUpdateStockMutation,
  useGetDeliveryStatusQuery,
  useUpdateDiscountMutation,
  useGetDiscountStatusQuery,
  useUploadProductImageMutation,
  useCreateProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useGetLatestProductsQuery,
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useGetCategoriesTreeQuery,
  useCreateDiscountMutation,
  useDeleteDiscountMutation,
  useDeleteImageMutation,
} = productApi;
