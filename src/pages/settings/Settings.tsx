import Layout from "../../Layout";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  useUpdateStoreStatusMutation,
  useGetStoreStatusQuery,
} from "../../redux/queries/maintenanceApi";
import Spinner from "../../components/Spinner";
import { Separator } from "../../components/ui/separator";
import { Loader2Icon } from "lucide-react";
import { toggleLang } from "../../redux/slices/languageSlice";
import { useSelector, useDispatch } from "react-redux";
import { Globe } from "lucide-react";
function Settings() {
  const [updateStoreStatus, { isLoading: loadingUpdateStatus }] = useUpdateStoreStatusMutation();
  const { data: storeStatus, refetch, isLoading } = useGetStoreStatusQuery(undefined);

  const [status, setStatus] = useState("");
  const [banner, setBanner] = useState("");

  const language = useSelector((state: any) => state.language.lang);
  const dispatch = useDispatch();
  // language state
  // const [language, setLanguage] = useState<"en" | "ar">("en");

  const handleUpdateStoreStatus = async () => {
    await updateStoreStatus({ status, banner: banner.trim() });
    setBanner("");
    toast.success(
      language === "en" ? "Store status updated successfully" : "تم تحديث حالة المتجر بنجاح"
    );
    refetch();
  };

  const formatDate = (isoString: any) => {
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
    if (storeStatus?.[0]) {
      setStatus(storeStatus[0].status || "");
      setBanner(storeStatus[0].banner || "");
    }
  }, [storeStatus]);

  return (
    <Layout>
      <div
        dir={language === "ar" ? "rtl" : ""}
        className="px-4 w-full min-h-screen lg:w-4xl text-lg py-6 mt-[50px] space-y-5">
        {/* Update Section */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold text-zinc-800">
              {language === "en" ? "Settings" : "الإعدادات"}
            </h1>

            {/* Language toggle button */}
            <button
              onClick={() => dispatch(toggleLang())}
              className="flex items-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)] gap-2 px-4 py-2 bg-white border rounded-full  hover:bg-zinc-100 transition">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-zinc-700">
                {language === "en" ? "العربية" : "English"}
              </span>
            </button>
          </div>

          <Separator className="my-4 bg-black/10" />

          <div className="bg-white border rounded-xl p-5  space-y-4">
            {/* Row with select and button */}
            <div className="flex items-end gap-6">
              <div className="w-full lg:w-full">
                <label className="block mb-1 text-sm font-medium text-zinc-700">
                  {language === "en" ? "Store condition" : "حالة المتجر"}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="cursor-pointer px-4 py-2 border rounded-lg outline-0 shadow-sm focus:ring-2 focus:ring-blue-500 w-full ">
                  <option value="" disabled>
                    {language === "en" ? "Choose store condition" : "اختر حالة المتجر"}
                  </option>
                  <option value="active">{language === "en" ? "Active" : "نشط"}</option>
                  <option value="maintenance">{language === "en" ? "Maintenance" : "صيانة"}</option>
                </select>
              </div>

              <div className="w-full lg:w-[200px]">
                <button
                  onClick={handleUpdateStoreStatus}
                  disabled={loadingUpdateStatus}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-6 py-2 rounded-lg shadow-lg
             drop-shadow-[0_0_10px_rgba(24,24,27,0.5)]
           
             transition-all duration-200 w-full flex justify-center items-center">
                  {loadingUpdateStatus ? (
                    <Loader2Icon className="animate-spin" />
                  ) : language === "en" ? (
                    "Update"
                  ) : (
                    "تحديث"
                  )}
                </button>
              </div>
            </div>

            {/* Banner textarea below */}
            <div className="w-full lg:w-full">
              <label className="block mb-1 text-sm font-medium text-zinc-700">
                {language === "en" ? "Banner Text" : "نص البانر"}
              </label>
              <textarea
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                rows={3}
                placeholder={
                  language === "en" ? "Enter banner text (optional)" : "أدخل نص البانر (اختياري)"
                }
                className="w-full px-4 py-2 border outline-0 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Current Status Section */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-lg font-bold text-zinc-800">
              {language === "en" ? "Current Store Status" : "حالة المتجر الحالية"}
            </h1>
          </div>
          <Separator className="my-4 bg-black/10" />

          <div className="bg-white border rounded-xl p-5  flex flex-col gap-4 lg:gap-6 font-semibold text-zinc-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-start gap-4 lg:gap-10">
              <div>
                <span className="block text-xs text-zinc-500">
                  {language === "en" ? "Condition" : "الحالة"}
                </span>
                {isLoading ? (
                  <Spinner className="border-t-black" />
                ) : storeStatus?.[0].status === "active" ? (
                  <p className="capitalize text-teal-500">{language === "en" ? "Active" : "نشط"}</p>
                ) : (
                  <p className="capitalize text-rose-500">
                    {language === "en" ? "Maintenance" : "صيانة"}
                  </p>
                )}
              </div>

              <div>
                <span className="block text-xs text-zinc-500">
                  {language === "en" ? "Last updated" : "آخر تحديث"}
                </span>
                {isLoading ? (
                  <Spinner className="border-t-black" />
                ) : (
                  <p>{formatDate(storeStatus?.[0].updatedAt)}</p>
                )}
              </div>
            </div>

            <div>
              <span className="block text-xs text-zinc-500">
                {language === "en" ? "Banner Text" : "نص البانر"}
              </span>
              {isLoading ? (
                <Spinner className="border-t-black" />
              ) : (
                <p className="whitespace-pre-wrap max-w-md break-words">
                  {storeStatus?.[0].banner?.trim()
                    ? storeStatus[0].banner
                    : language === "en"
                    ? "No banner"
                    : "لا يوجد"}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Settings;
