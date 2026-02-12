import { api } from "./api";

export const deliveryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET delivery settings
    getDeliveryStatus: builder.query({
      query: () => ({
        url: "/api/delivery",
        method: "GET",
      }),
      providesTags: ["Delivery"],
    }),

    // ✅ PUT update delivery settings
    updateDeliverySettings: builder.mutation({
      query: (data) => ({
        url: "/api/delivery",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Delivery"],
    }),

    // ✅ OPTIONAL: disable advanced (free threshold + zones)
    disableAdvancedDelivery: builder.mutation({
      query: () => ({
        url: "/api/delivery/disable-advanced",
        method: "PATCH",
      }),
      invalidatesTags: ["Delivery"],
    }),
  }),
  overrideExisting: false,
});

// ✅ correct export name (you had maintenanceApi by mistake)
export const {
  useGetDeliveryStatusQuery,
  useUpdateDeliverySettingsMutation,
  useDisableAdvancedDeliveryMutation,
} = deliveryApi;
