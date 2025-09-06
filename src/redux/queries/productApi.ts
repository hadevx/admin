import { api } from "./api";

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
      invalidatesTags: ["Product"],
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
      query: (id: string) => ({
        url: `/api/products/discount/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    updateDiscount: builder.mutation({
      query: (data) => ({
        url: `/api/products/discount`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    getDiscountStatus: builder.query({
      query: () => ({
        url: `/api/products/discount`,
      }),
    }),

    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: "/api/upload",
        method: "POST",
        body: data,
      }),
    }),
    uploadCategoryImage: builder.mutation({
      query: (data) => ({
        url: "/api/upload/category",
        method: "POST",
        body: data,
      }),
    }),
    uploadVariantImage: builder.mutation({
      query: (data) => ({
        url: "/api/upload/variant",
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
      // Invalidate the "Product" tag so all queries providing it will refetch
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: `/api/products/${data._id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProductVariant: builder.mutation({
      query: ({ productId, variantId, color, sizes, images }) => ({
        url: `/api/products/variant/${productId}`,
        method: "PUT",
        body: { variantId, color, sizes, images },
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProductVariant: builder.mutation({
      query: ({ productId, variantId }) => ({
        url: `/api/products/variant/${productId}`,
        method: "DELETE",
        body: { variantId },
      }),
      invalidatesTags: ["Product"],
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
  useGetAllCategoriesQuery,
  useUploadCategoryImageMutation,
  useUpdateCategoryMutation,
  useUploadVariantImageMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
} = productApi;
