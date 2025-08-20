import Layout from "../../Layout";
import { useState } from "react";
import { useUpdateDeliverMutation } from "../../redux/queries/orderApi";
import { toast } from "react-toastify";
import { useGetDeliveryStatusQuery } from "../../redux/queries/productApi";
import Spinner from "../../components/Spinner";
import { Separator } from "../../components/ui/separator";
import { Loader2Icon } from "lucide-react";
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

  const t = labels[language];

  const [timeToDeliver, setTimeToDeliver] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [minDeliveryCost, setMinDeliveryCost] = useState("");

  const { data: deliveryStatus, refetch, isLoading } = useGetDeliveryStatusQuery(undefined);
  const [updateDelivery, { isLoading: loadingUpdateDelivery }] = useUpdateDeliverMutation();

  const handleUpdateDelivery = async () => {
    await updateDelivery({ timeToDeliver, shippingFee, minDeliveryCost });
    toast.success(t.updateSettings); // Optional: adjust toast for Arabic
    refetch();
  };

  const render = () => {
    if (language === "ar") {
      if (deliveryStatus?.[0]?.timeToDeliver === "today") {
        return "اليوم";
      }
      if (deliveryStatus?.[0]?.timeToDeliver === "tomorrow") {
        return "غدا";
      }
      if (deliveryStatus?.[0]?.timeToDeliver === "two days") {
        return "يومين";
      }
    } else {
      return deliveryStatus?.[0]?.timeToDeliver;
    }
  };

  return (
    <Layout>
      <div
        dir={language === "ar" ? "rtl" : ""}
        className="px-4 w-full lg:w-4xl min-h-screen lg:min-h-auto lg:text-lg py-6 mt-[70px] lg:mt-[50px] space-y-5">
        {/* Update Section */}
        <section>
          <div className={`flex items-center gap-2 mb-2 `}>
            <h1 className="text-lg font-bold text-zinc-800 ">{t.updateSettings}</h1>
          </div>
          <Separator className="my-4 bg-black/10" />

          <div className="bg-white border rounded-xl p-5 space-y-3 lg:space-y-0 lg:flex lg:items-end lg:justify-between gap-6">
            {/* Time to Deliver */}
            <div className="w-full lg:w-[200px]">
              <label className="block mb-1 text-sm font-medium text-zinc-700">
                {t.timeToDeliver}
              </label>
              <select
                onChange={(e) => setTimeToDeliver(e.target.value)}
                value={timeToDeliver}
                className="cursor-pointer text-base px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 w-full">
                <option value="" disabled>
                  {t.chooseTime}
                </option>
                <option value="today">{language === "ar" ? "اليوم" : "Today"}</option>
                <option value="tomorrow">{language === "ar" ? "غدًا" : "Tomorrow"}</option>
                <option value="two days">{language === "ar" ? "يومين" : "2 days"}</option>
              </select>
            </div>

            {/* Shipping Fee */}
            <div className="w-full lg:w-[200px]">
              <label className="block mb-1 text-sm font-medium text-zinc-700">
                {t.shippingFee}
              </label>
              <select
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                className="cursor-pointer text-base px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 w-full">
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

            {/* Min delivery cost */}
            <div className="w-full lg:w-[200px]">
              <p className="block mb-1 text-sm font-medium text-zinc-700">{t.minDeliveryCost}</p>
              <select
                value={minDeliveryCost}
                onChange={(e) => setMinDeliveryCost(e.target.value)}
                className="cursor-pointer px-4 text-base py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 w-full">
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

            {/* Update Button */}
            <div className="w-full mt-5 lg:w-[200px]">
              <button
                onClick={handleUpdateDelivery}
                disabled={loadingUpdateDelivery}
                className="bg-zinc-900  drop-shadow-[0_0_10px_rgba(24,24,27,0.5)] hover:bg-zinc-800 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-200 w-full flex justify-center items-center">
                {loadingUpdateDelivery ? <Loader2Icon className="animate-spin" /> : t.updateBtn}
              </button>
            </div>
          </div>
        </section>

        {/* Current Status Section */}
        <section>
          <div className={`flex lg:text-lg items-center gap-2 mb-2 `}>
            <h1 className="text-lg font-bold text-zinc-800">{t.currentStatus}</h1>
          </div>
          <Separator className="my-4 bg-black/10" />

          <div className="bg-white border rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-start gap-3 lg:gap-10 font-semibold text-zinc-800">
            <div>
              <span className="block text-xs text-zinc-500">{t.timeToDeliver}</span>
              {isLoading ? (
                <Spinner className="border-t-black" />
              ) : (
                <p className="capitalize">{render()}</p>
              )}
            </div>

            <div>
              <span className="block text-xs text-zinc-500">{t.shippingFee}</span>
              {isLoading ? (
                <Spinner className="border-t-black" />
              ) : deliveryStatus?.[0]?.shippingFee === 0 ? (
                <p>{t.free}</p>
              ) : (
                <p>
                  {deliveryStatus?.[0]?.shippingFee.toFixed(3)}
                  {language === "ar" ? " دك" : "KD"}
                </p>
              )}
            </div>

            <div>
              <span className="block text-xs text-zinc-500">{t.minDeliveryCost}</span>
              {isLoading ? (
                <Spinner className="border-t-black" />
              ) : deliveryStatus?.[0]?.minDeliveryCost === 0 ? (
                <p>{t.noMinimum}</p>
              ) : (
                <p>
                  {deliveryStatus?.[0]?.minDeliveryCost.toFixed(3)}{" "}
                  {language === "ar" ? " دك" : "KD"}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Delivery;
