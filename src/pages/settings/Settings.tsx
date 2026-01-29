import Layout from "../../Layout";
import { useState, useEffect, type JSX } from "react";
import { toast } from "react-toastify";
import {
  useUpdateStoreStatusMutation,
  useGetStoreStatusQuery,
} from "../../redux/queries/maintenanceApi";
import Spinner from "../../components/Spinner";
import { Separator } from "../../components/ui/separator";
import { Loader2Icon, Globe, Store, Wrench, Megaphone, Clock } from "lucide-react";
import { toggleLang } from "../../redux/slices/languageSlice";
import { useSelector, useDispatch } from "react-redux";

type RootState = {
  language: { lang: "en" | "ar" };
};

type StoreStatusItem = {
  status?: "active" | "maintenance" | string;
  banner?: string;
  updatedAt?: string;
};

function Settings(): JSX.Element {
  const [updateStoreStatus, { isLoading: loadingUpdateStatus }] = useUpdateStoreStatusMutation();

  const {
    data: storeStatus,
    refetch,
    isLoading,
  } = useGetStoreStatusQuery(undefined) as {
    data?: StoreStatusItem[];
    refetch: () => void;
    isLoading: boolean;
  };

  const [status, setStatus] = useState<string>("");
  const [banner, setBanner] = useState<string>("");

  const language = useSelector((state: RootState) => state.language.lang);
  const dispatch = useDispatch();

  const current = storeStatus?.[0];

  const handleUpdateStoreStatus = async (): Promise<void> => {
    await updateStoreStatus({ status, banner: banner.trim() });
    setBanner("");
    toast.success(
      language === "en" ? "Store status updated successfully" : "تم تحديث حالة المتجر بنجاح",
    );
    refetch();
  };

  const formatDate = (isoString?: string): string => {
    if (!isoString) return language === "en" ? "N/A" : "غير متوفر";
    const date = new Date(isoString);
    return date.toLocaleString(language === "en" ? "en-US" : "ar-KW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (current) {
      setStatus(current?.status || "");
      setBanner(current?.banner || "");
    }
  }, [current]);

  const bentoCard = "rounded-3xl border border-black/10 bg-white/80 backdrop-blur shadow-sm";

  const pill =
    "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition drop-shadow-[0_1px_1px_rgba(0,0,0,0.08)]";

  return (
    <Layout>
      <div
        dir={language === "ar" ? "rtl" : "ltr"}
        className="px-4 w-full max-w-4xl  min-h-screen py-6 mt-[50px]">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-800">
              {language === "en" ? "Settings" : "الإعدادات"}
            </h1>
            <p className="text-sm text-zinc-600">
              {language === "en"
                ? "Manage store mode and banner message."
                : "إدارة وضع المتجر ورسالة البانر."}
            </p>
          </div>

          <button onClick={() => dispatch(toggleLang())} className={pill}>
            <Globe className="w-4 h-4 text-blue-500" />
            <span>{language === "en" ? "العربية" : "English"}</span>
          </button>
        </div>

        <Separator className="my-4 bg-black/10" />

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Update (wide card) */}
          <section className={`${bentoCard} lg:col-span-8 p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-zinc-900 text-white grid place-items-center">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-zinc-900">
                    {language === "en" ? "Update Store Status" : "تحديث حالة المتجر"}
                  </h2>
                  <p className="text-sm text-zinc-600">
                    {language === "en"
                      ? "Switch between Active and Maintenance."
                      : "التبديل بين نشط وصيانة."}
                  </p>
                </div>
              </div>

              <button
                onClick={handleUpdateStoreStatus}
                disabled={loadingUpdateStatus}
                className="hidden md:flex bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-5 py-2.5 rounded-2xl shadow-lg drop-shadow-[0_0_10px_rgba(24,24,27,0.35)] transition-all duration-200 items-center gap-2 disabled:opacity-60">
                {loadingUpdateStatus ? <Loader2Icon className="animate-spin h-4 w-4" /> : null}
                {language === "en" ? "Update" : "تحديث"}
              </button>
            </div>

            <Separator className="my-4 bg-black/10" />

            {/* Bento inner grid */}
            <div className="grid grid-cols-1  gap-3">
              {/* Store condition */}
              <div className="md:col-span-12 rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-4 w-4 text-zinc-700" />
                  <label className="text-sm font-semibold text-zinc-800">
                    {language === "en" ? "Store condition" : "حالة المتجر"}
                  </label>
                </div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="cursor-pointer px-4 py-2.5 border border-black/10 rounded-xl outline-0 shadow-sm focus:ring-2 focus:ring-blue-500 w-full bg-white">
                  <option value="" disabled>
                    {language === "en" ? "Choose store condition" : "اختر حالة المتجر"}
                  </option>
                  <option value="active">{language === "en" ? "Active" : "نشط"}</option>
                  <option value="maintenance">{language === "en" ? "Maintenance" : "صيانة"}</option>
                </select>
              </div>

              {/* Banner */}
              <div className="md:col-span-12 rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="h-4 w-4 text-zinc-700" />
                  <label className="text-sm font-semibold text-zinc-800">
                    {language === "en" ? "Banner Text" : "نص البانر"}
                  </label>
                </div>
                <textarea
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  rows={3}
                  placeholder={
                    language === "en" ? "Enter banner text (optional)" : "أدخل نص البانر (اختياري)"
                  }
                  className="w-full px-4 py-2.5 border border-black/10 outline-0 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                />
              </div>
            </div>
          </section>

          {/* Current status (stacked bento tiles) */}
          <section className={`${bentoCard} lg:col-span-4 p-5`}>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-zinc-900 text-white grid place-items-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-zinc-900">
                  {language === "en" ? "Current Store Status" : "حالة المتجر الحالية"}
                </h2>
                <p className="text-sm text-zinc-600">
                  {language === "en"
                    ? "Live status from the server."
                    : "الحالة الحالية من السيرفر."}
                </p>
              </div>
            </div>

            <Separator className="my-4 bg-black/10" />

            <div className="grid grid-cols-1 gap-3">
              {/* Condition */}
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <span className="block text-xs text-zinc-500">
                  {language === "en" ? "Condition" : "الحالة"}
                </span>

                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black" />
                  </div>
                ) : current?.status === "active" ? (
                  <p className="mt-1 font-semibold text-teal-600">
                    {language === "en" ? "Active" : "نشط"}
                  </p>
                ) : (
                  <p className="mt-1 font-semibold text-rose-600">
                    {language === "en" ? "Maintenance" : "صيانة"}
                  </p>
                )}
              </div>

              {/* Last updated */}
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <span className="block text-xs text-zinc-500">
                  {language === "en" ? "Last updated" : "آخر تحديث"}
                </span>

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

              {/* Banner text */}
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <span className="block text-xs text-zinc-500">
                  {language === "en" ? "Banner Text" : "نص البانر"}
                </span>

                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black" />
                  </div>
                ) : (
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold text-zinc-900">
                    {current?.banner?.trim()
                      ? current.banner
                      : language === "en"
                        ? "No banner"
                        : "لا يوجد"}
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

export default Settings;
