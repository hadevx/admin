import Layout from "../../Layout";
import { useEffect, useMemo, useState } from "react";
import { useUpdateDeliverMutation } from "../../redux/queries/orderApi";
import { useGetDeliveryStatusQuery } from "../../redux/queries/productApi";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";
import { Separator } from "../../components/ui/separator";
import { Loader2Icon, Truck, Clock3, Coins, ShieldCheck } from "lucide-react";
import { useSelector } from "react-redux";

type RootState = {
  language: { lang: "en" | "ar" };
};

type DeliveryStatusItem = {
  timeToDeliver?: "today" | "tomorrow" | "two days" | string;
  shippingFee?: number;
  minDeliveryCost?: number;
  updatedAt?: string;
};

function Delivery() {
  const language = useSelector((state: RootState) => state.language.lang);

  const labels: any = {
    en: {
      pageTitle: "Delivery",
      pageDesc: "Manage delivery ETA, fees, and minimum order amount.",
      updateSettings: "Update Delivery Settings",
      timeToDeliver: "Time to Deliver",
      shippingFee: "Shipping Fee",
      minDeliveryCost: "Min Delivery Cost",
      chooseTime: "Choose time to deliver",
      chooseFee: "Choose shipping fee",
      minCost: "Min delivery cost",
      free: "Free",
      noMinimum: "No minimum cost",
      updateBtn: "Update",
      currentStatus: "Current Delivery Status",
      lastUpdated: "Last updated",
      today: "Today",
      tomorrow: "Tomorrow",
      twoDays: "2 days",
      updatedSuccess: "Delivery settings updated successfully",
      updateFailed: "Failed to update delivery settings",
      na: "N/A",
    },
    ar: {
      pageTitle: "التوصيل",
      pageDesc: "إدارة وقت التوصيل والرسوم والحد الأدنى للطلب.",
      updateSettings: "تحديث إعدادات التوصيل",
      timeToDeliver: "وقت التوصيل",
      shippingFee: "رسوم الشحن",
      minDeliveryCost: "الحد الأدنى للتوصيل",
      chooseTime: "اختر وقت التوصيل",
      chooseFee: "اختر رسوم الشحن",
      minCost: "الحد الأدنى للتوصيل",
      free: "مجاني",
      noMinimum: "لا يوجد حد أدنى",
      updateBtn: "تحديث",
      currentStatus: "حالة التوصيل الحالية",
      lastUpdated: "آخر تحديث",
      today: "اليوم",
      tomorrow: "غدًا",
      twoDays: "يومين",
      updatedSuccess: "تم تحديث إعدادات التوصيل بنجاح",
      updateFailed: "فشل تحديث إعدادات التوصيل",
      na: "غير متوفر",
    },
  };

  const t = labels[language] || labels.en;

  const [timeToDeliver, setTimeToDeliver] = useState<string>("");
  const [shippingFee, setShippingFee] = useState<string>("");
  const [minDeliveryCost, setMinDeliveryCost] = useState<string>("");

  const {
    data: deliveryStatus,
    refetch,
    isLoading,
  } = useGetDeliveryStatusQuery(undefined) as {
    data?: DeliveryStatusItem[];
    refetch: () => void;
    isLoading: boolean;
  };

  const [updateDelivery, { isLoading: loadingUpdateDelivery }] = useUpdateDeliverMutation();

  const current = deliveryStatus?.[0];

  // Prefill once when data arrives
  useEffect(() => {
    if (!current) return;
    setTimeToDeliver((v) => (v ? v : (current?.timeToDeliver as string) || ""));
    setShippingFee((v) => (v !== "" ? v : String(current?.shippingFee ?? "")));
    setMinDeliveryCost((v) => (v !== "" ? v : String(current?.minDeliveryCost ?? "")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const handleUpdateDelivery = async () => {
    try {
      await updateDelivery({ timeToDeliver, shippingFee, minDeliveryCost }).unwrap?.();
      toast.success(t.updatedSuccess);
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.message || t.updateFailed);
    }
  };

  const formatDate = (isoString?: string): string => {
    if (!isoString) return t.na;
    const date = new Date(isoString);
    return date.toLocaleString(language === "en" ? "en-US" : "ar-KW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTime = () => {
    const v = current?.timeToDeliver;
    if (v === "today") return t.today;
    if (v === "tomorrow") return t.tomorrow;
    if (v === "two days") return t.twoDays;
    return v || "—";
  };

  const money = (n?: number) => {
    if (typeof n !== "number") return "—";
    return `${n.toFixed(3)} ${language === "ar" ? "دك" : "KD"}`;
  };

  const currentFeeText = useMemo(() => {
    if (current?.shippingFee === 0) return t.free;
    return money(current?.shippingFee);
  }, [current?.shippingFee, language]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentMinText = useMemo(() => {
    if (current?.minDeliveryCost === 0) return t.noMinimum;
    return money(current?.minDeliveryCost);
  }, [current?.minDeliveryCost, language]); // eslint-disable-line react-hooks/exhaustive-deps

  const bentoCard = "rounded-3xl border border-black/10 bg-white/80 backdrop-blur shadow-sm";

  return (
    <Layout>
      <div
        dir={language === "ar" ? "rtl" : "ltr"}
        className="px-4 w-full max-w-4xl min-h-screen py-6 mt-[50px]">
        {/* Header row (consistent with Settings) */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-800">{t.pageTitle}</h1>
            <p className="text-sm text-zinc-600">{t.pageDesc}</p>
          </div>
        </div>

        <Separator className="my-4 bg-black/10" />

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Update (wide card) */}
          <section className={`${bentoCard} lg:col-span-8 p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-zinc-900 text-white grid place-items-center">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-zinc-900">
                    {t.updateSettings}
                  </h2>
                  <p className="text-sm text-zinc-600">{t.pageDesc}</p>
                </div>
              </div>

              <button
                onClick={handleUpdateDelivery}
                disabled={loadingUpdateDelivery}
                className="flex bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-5 py-2.5 rounded-2xl shadow-lg drop-shadow-[0_0_10px_rgba(24,24,27,0.35)] transition-all duration-200 items-center gap-2 disabled:opacity-60">
                {loadingUpdateDelivery ? <Loader2Icon className="animate-spin h-4 w-4" /> : null}
                {t.updateBtn}
              </button>
            </div>

            <Separator className="my-4 bg-black/10" />

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Time */}
              <div className="md:col-span-12 rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock3 className="h-4 w-4 text-zinc-700" />
                  <label className="text-sm font-semibold text-zinc-800">{t.timeToDeliver}</label>
                </div>
                <select
                  onChange={(e) => setTimeToDeliver(e.target.value)}
                  value={timeToDeliver}
                  className="cursor-pointer px-4 py-2.5 border border-black/10 rounded-xl outline-0 shadow-sm focus:ring-2 focus:ring-blue-500 w-full bg-white">
                  <option value="" disabled>
                    {t.chooseTime}
                  </option>
                  <option value="today">{t.today}</option>
                  <option value="tomorrow">{t.tomorrow}</option>
                  <option value="two days">{t.twoDays}</option>
                </select>
              </div>

              {/* Shipping fee */}
              <div className="md:col-span-12 rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-zinc-700" />
                  <label className="text-sm font-semibold text-zinc-800">{t.shippingFee}</label>
                </div>
                <select
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                  className="cursor-pointer px-4 py-2.5 border border-black/10 rounded-xl outline-0 shadow-sm focus:ring-2 focus:ring-blue-500 w-full bg-white">
                  <option value="" disabled>
                    {t.chooseFee}
                  </option>
                  {[0, 1, 2, 3, 4, 5].map((fee) => (
                    <option key={fee} value={fee}>
                      {fee === 0 ? t.free : `${fee}.000 ${language === "ar" ? "دك" : "KD"}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min */}
              <div className="md:col-span-12 rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-zinc-700" />
                  <label className="text-sm font-semibold text-zinc-800">{t.minDeliveryCost}</label>
                </div>
                <select
                  value={minDeliveryCost}
                  onChange={(e) => setMinDeliveryCost(e.target.value)}
                  className="cursor-pointer px-4 py-2.5 border border-black/10 rounded-xl outline-0 shadow-sm focus:ring-2 focus:ring-blue-500 w-full bg-white">
                  <option value="" disabled>
                    {t.minCost}
                  </option>
                  {[0, 1, 2, 3, 4, 5].map((fee) => (
                    <option key={fee} value={fee}>
                      {fee === 0 ? t.noMinimum : `${fee}.000 ${language === "ar" ? "دك" : "KD"}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Current status (stacked tiles) */}
          <section className={`${bentoCard} lg:col-span-4 p-5`}>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-zinc-900 text-white grid place-items-center">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-zinc-900">{t.currentStatus}</h2>
                <p className="text-sm text-zinc-600">
                  {language === "ar"
                    ? "الحالة الحالية من السيرفر."
                    : "Live status from the server."}
                </p>
              </div>
            </div>

            <Separator className="my-4 bg-black/10" />

            <div className="grid grid-cols-1 gap-3">
              {/* Time tile */}
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <span className="block text-xs text-zinc-500">{t.timeToDeliver}</span>
                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black" />
                  </div>
                ) : (
                  <p className="mt-1 text-base font-semibold text-zinc-900 capitalize">
                    {renderTime()}
                  </p>
                )}
              </div>

              {/* Fee tile */}
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <span className="block text-xs text-zinc-500">{t.shippingFee}</span>
                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black" />
                  </div>
                ) : (
                  <p className="mt-1 text-base font-semibold text-zinc-900">{currentFeeText}</p>
                )}
              </div>

              {/* Min tile */}
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <span className="block text-xs text-zinc-500">{t.minDeliveryCost}</span>
                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black" />
                  </div>
                ) : (
                  <p className="mt-1 text-base font-semibold text-zinc-900">{currentMinText}</p>
                )}
              </div>

              {/* Last updated (consistent with Settings) */}
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <span className="block text-xs text-zinc-500">{t.lastUpdated}</span>
                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black" />
                  </div>
                ) : (
                  <p className="mt-1 font-semibold text-zinc-900">
                    {formatDate(current?.updatedAt)}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default Delivery;
