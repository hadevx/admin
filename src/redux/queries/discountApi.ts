import { api } from "./api";

export const discountApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createDiscount: builder.mutation({
      query: (data) => ({
        url: `/api/discount`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product", "Discount"],
    }),

    deleteDiscount: builder.mutation({
      query: (id: string) => ({
        url: `/api/discount/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product", "Discount"],
    }),

    updateDiscount: builder.mutation({
      query: (data) => ({
        url: `/api/discount`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product", "Discount"],
    }),

    getDiscountStatus: builder.query({
      query: () => ({
        url: `/api/discount`,
      }),
      providesTags: ["Discount"],
    }),
  }),
});

// ✅ correct export name (you had maintenanceApi by mistake)
export const {
  useCreateDiscountMutation,
  useDeleteDiscountMutation,
  useGetDiscountStatusQuery,
  useUpdateDiscountMutation,
} = discountApi;
