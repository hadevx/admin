// redux/queries/productApi.ts
import { api } from "./api";

export type GetProductsArgs = {
  pageNumber?: number;
  keyword?: string;
  limit?: number;
  category?: string;
  color?: string | string[];
  inStock?: boolean;
  minPrice?: string | number;
  maxPrice?: string | number;
  featured: boolean;
};

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET PRODUCTS (with filters)
    getProducts: builder.query<any, GetProductsArgs | void>({
      query: (args) => {
        const {
          pageNumber = 1,
          keyword = "",
          limit = 30,
          category = "",
          color = "",
          inStock = false,
          featured = false, // ✅
          minPrice = "",
          maxPrice = "",
        } = args ?? {};

        const params = new URLSearchParams();

        params.set("pageNumber", String(pageNumber));
        params.set("limit", String(limit));

        if (keyword.trim()) params.set("keyword", keyword.trim());
        if (category.trim()) params.set("category", category.trim());

        const colorStr = Array.isArray(color) ? color.join(",") : String(color || "").trim();
        if (colorStr) params.set("color", colorStr);

        if (inStock) params.set("inStock", "true");

        // ✅ featured
        if (featured) params.set("featured", "true");

        if (minPrice !== "" && minPrice != null) params.set("minPrice", String(minPrice));
        if (maxPrice !== "" && maxPrice != null) params.set("maxPrice", String(maxPrice));

        return { url: `/api/products?${params.toString()}` };
      },
      providesTags: ["Product"],
    }),

    getProductById: builder.query<any, string>({
      query: (productId) => ({
        url: `/api/products/${productId}`,
      }),
    }),

    getProductsByCategory: builder.query<any, string>({
      query: (category) => ({
        url: `/api/products/category/${category}`,
      }),
    }),

    updateStock: builder.mutation<any, any>({
      query: (orderItems) => ({
        url: "/api/products/update-stock",
        method: "POST",
        body: orderItems,
      }),
      invalidatesTags: ["Product"],
    }),

    uploadProductImage: builder.mutation<any, FormData>({
      query: (data) => ({
        url: "/api/upload",
        method: "POST",
        body: data,
      }),
    }),

    uploadVariantImage: builder.mutation<any, FormData>({
      query: (data) => ({
        url: "/api/upload/variant",
        method: "POST",
        body: data,
      }),
    }),

    createProduct: builder.mutation<any, any>({
      query: (data) => ({
        url: `/api/products`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation<any, string>({
      query: (productId) => ({
        url: `/api/products/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation<any, any>({
      query: (data) => ({
        url: `/api/products/${data._id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    updateProductVariant: builder.mutation<
      any,
      { productId: string; variantId: string; color: string; sizes: any[]; images: any[] }
    >({
      query: ({ productId, variantId, color, sizes, images }) => ({
        url: `/api/products/variant/${productId}`,
        method: "PUT",
        body: { variantId, color, sizes, images },
      }),
      invalidatesTags: ["Product"],
    }),

    deleteProductVariant: builder.mutation<any, { productId: string; variantId: string }>({
      query: ({ productId, variantId }) => ({
        url: `/api/products/variant/${productId}`,
        method: "DELETE",
        body: { variantId },
      }),
      invalidatesTags: ["Product"],
    }),

    deleteImage: builder.mutation<any, any>({
      query: (data) => ({
        url: `/api/products/delete-image`,
        method: "POST",
        body: data,
      }),
    }),

    getLatestProducts: builder.query<any, void>({
      query: () => ({
        url: "/api/products/latest",
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductsByCategoryQuery,
  useUpdateStockMutation,
  useUploadProductImageMutation,
  useCreateProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useGetLatestProductsQuery,
  useDeleteImageMutation,
  useUploadVariantImageMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
} = productApi;
