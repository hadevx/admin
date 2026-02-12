export type RootState = {
  language: { lang: "en" | "ar" };
};

export type ZoneFee = {
  zone: string;
  fee: number;
};

export type DeliveryStatusItem = {
  timeToDeliver?: string;
  shippingFee?: number;
  minDeliveryCost?: number;
  updatedAt?: string;
  freeDeliveryThreshold?: number;
  zoneFees?: ZoneFee[];
};
