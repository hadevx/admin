import { api } from "./api";

export const couponApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query({
      query: () => ({
        url: `/api/coupons`,
      }),
      providesTags: ["Coupon"],
    }),

    createCoupon: builder.mutation({
      query: (data) => ({
        url: `/api/coupons`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Coupon"],
    }),

    deleteCoupon: builder.mutation({
      query: (id: string) => ({
        url: `/api/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Coupon"],
    }),
  }),
});

export const { useGetCouponsQuery, useCreateCouponMutation, useDeleteCouponMutation } = couponApi;
