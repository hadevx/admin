import Layout from "../../Layout";
import { useEffect, useMemo, useState } from "react";
import { useUpdateDeliverMutation } from "../../redux/queries/orderApi";
import { toast } from "react-toastify";
import { useGetDeliveryStatusQuery } from "../../redux/queries/productApi";
import Spinner from "../../components/Spinner";
import { Separator } from "../../components/ui/separator";
import { Loader2Icon, Truck, Clock3, Coins, ShieldCheck } from "lucide-react";
import { useSelector } from "react-redux";

function Delivery() {
  const language = useSelector((state: any) => state.language.lang);

  const labels: any = {
    en: {
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
    },
    ar: {
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
    },
  };

  const t = labels[language] || labels.en;

  const [timeToDeliver, setTimeToDeliver] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [minDeliveryCost, setMinDeliveryCost] = useState("");

  const { data: deliveryStatus, refetch, isLoading } = useGetDeliveryStatusQuery(undefined);
  const [updateDelivery, { isLoading: loadingUpdateDelivery }] = useUpdateDeliverMutation();

  const current = deliveryStatus?.[0];

  // Prefill once when data arrives (nice UX, still no "new features")
  useEffect(() => {
    if (!current) return;
    setTimeToDeliver((v) => (v ? v : current?.timeToDeliver || ""));
    setShippingFee((v) => (v !== "" ? v : String(current?.shippingFee ?? "")));
    setMinDeliveryCost((v) => (v !== "" ? v : String(current?.minDeliveryCost ?? "")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const handleUpdateDelivery = async () => {
    await updateDelivery({ timeToDeliver, shippingFee, minDeliveryCost });
    toast.success(t.updateSettings);
    refetch();
  };

  const renderTime = () => {
    const v = current?.timeToDeliver;
    if (language === "ar") {
      if (v === "today") return "اليوم";
      if (v === "tomorrow") return "غدا";
      if (v === "two days") return "يومين";
    }
    return v;
  };

  const currentFeeText = useMemo(() => {
    if (current?.shippingFee === 0) return t.free;
    if (typeof current?.shippingFee === "number")
      return `${current.shippingFee.toFixed(3)} ${language === "ar" ? "دك" : "KD"}`;
    return "—";
  }, [current, language, t.free]);

  const currentMinText = useMemo(() => {
    if (current?.minDeliveryCost === 0) return t.noMinimum;
    if (typeof current?.minDeliveryCost === "number")
      return `${current.minDeliveryCost.toFixed(3)} ${language === "ar" ? "دك" : "KD"}`;
    return "—";
  }, [current, language, t.noMinimum]);

  const bentoCard = "rounded-3xl border border-black/10 bg-white/80 backdrop-blur shadow-sm";

  return (
    <Layout>
      <div
        dir={language === "ar" ? "rtl" : "ltr"}
        className="px-4 w-full max-w-4xl  min-h-screen py-6 mt-[70px] lg:mt-[50px]">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Title (wide) */}
          <div className={`${bentoCard} lg:col-span-8 p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-zinc-900 text-white grid place-items-center">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-zinc-900">{t.updateSettings}</h1>
                  <p className="text-sm text-zinc-600">
                    {language === "ar"
                      ? "قم بتحديث إعدادات وقت التوصيل والرسوم والحد الأدنى."
                      : "Update delivery ETA, fees, and minimum order amount."}
                  </p>
                </div>
              </div>

              <button
                onClick={handleUpdateDelivery}
                disabled={loadingUpdateDelivery}
                className="hidden md:flex bg-zinc-900 drop-shadow-[0_0_10px_rgba(24,24,27,0.35)] hover:bg-zinc-800 text-white font-semibold px-5 py-2.5 rounded-2xl transition-all duration-200 items-center gap-2 disabled:opacity-60">
                {loadingUpdateDelivery ? <Loader2Icon className="animate-spin h-4 w-4" /> : null}
                {t.updateBtn}
              </button>
            </div>

            <Separator className="my-4 bg-black/10" />

            {/* Inputs inside the wide card */}
            <div className="grid grid-cols-1  gap-3">
              {/* Time */}
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock3 className="h-4 w-4 text-zinc-700" />
                  <label className="text-sm font-semibold text-zinc-800">{t.timeToDeliver}</label>
                </div>
                <select
                  onChange={(e) => setTimeToDeliver(e.target.value)}
                  value={timeToDeliver}
                  className="cursor-pointer text-base px-4 py-2.5 border border-black/10 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 w-full bg-white">
                  <option value="" disabled>
                    {t.chooseTime}
                  </option>
                  <option value="today">{language === "ar" ? "اليوم" : "Today"}</option>
                  <option value="tomorrow">{language === "ar" ? "غدًا" : "Tomorrow"}</option>
                  <option value="two days">{language === "ar" ? "يومين" : "2 days"}</option>
                </select>
              </div>

              {/* Shipping fee */}
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-zinc-700" />
                  <label className="text-sm font-semibold text-zinc-800">{t.shippingFee}</label>
                </div>
                <select
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                  className="cursor-pointer text-base px-4 py-2.5 border border-black/10 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 w-full bg-white">
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
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-zinc-700" />
                  <label className="text-sm font-semibold text-zinc-800">{t.minDeliveryCost}</label>
                </div>
                <select
                  value={minDeliveryCost}
                  onChange={(e) => setMinDeliveryCost(e.target.value)}
                  className="cursor-pointer text-base px-4 py-2.5 border border-black/10 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 w-full bg-white">
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

            {/* Mobile update button */}
            <button
              onClick={handleUpdateDelivery}
              disabled={loadingUpdateDelivery}
              className="mt-4 md:hidden bg-zinc-900 drop-shadow-[0_0_10px_rgba(24,24,27,0.35)] hover:bg-zinc-800 text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-200 w-full flex justify-center items-center gap-2 disabled:opacity-60">
              {loadingUpdateDelivery ? <Loader2Icon className="animate-spin h-4 w-4" /> : null}
              {t.updateBtn}
            </button>
          </div>

          {/* Current status (stacked bento tiles) */}
          <div className={`${bentoCard} lg:col-span-4 p-5`}>
            <h2 className="text-lg font-bold text-zinc-900">{t.currentStatus}</h2>
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
                    {renderTime() || "—"}
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Delivery;
