import Layout from "../../Layout";
import { useState, useEffect, type JSX, type ReactNode } from "react";
import { toast } from "react-toastify";
import {
  useUpdateStoreStatusMutation,
  useGetStoreStatusQuery,
} from "../../redux/queries/maintenanceApi";
import Spinner from "../../components/Spinner";
import { Separator } from "../../components/ui/separator";
import {
  Loader2Icon,
  Globe,
  Store as StoreIcon,
  Wrench,
  Megaphone,
  Clock,
  Instagram,
  Twitter,
  Phone,
  Music2,
  Banknote,
  Mail,
  Building2,
  Save,
} from "lucide-react";
import { toggleLang } from "../../redux/slices/languageSlice";
import { useSelector, useDispatch } from "react-redux";
import clsx from "clsx";
import ThemeToggle from "@/components/ThemeToggle";

type RootState = {
  language: { lang: "en" | "ar" };
};

type StoreStatusItem = {
  status?: "active" | "maintenance" | "off" | string;
  storeName?: string;
  email?: string;

  banner?: string;
  updatedAt?: string;

  phoneNumber?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;

  cashOnDeliveryEnabled?: boolean;
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
  const [storeName, setStoreName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [banner, setBanner] = useState<string>("");

  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [tiktok, setTiktok] = useState<string>("");

  const [cashOnDeliveryEnabled, setCashOnDeliveryEnabled] = useState<boolean>(true);

  const language = useSelector((state: RootState) => state.language.lang);
  const dispatch = useDispatch();

  const current = storeStatus?.[0];

  const t = {
    settings: language === "en" ? "Settings" : "الإعدادات",
    desc:
      language === "en"
        ? "Manage store mode, info, contact links, and checkout options."
        : "إدارة وضع المتجر والمعلومات وروابط التواصل وخيارات الدفع.",
    save: language === "en" ? "Save" : "حفظ",
    updated: language === "en" ? "Settings updated successfully" : "تم تحديث الإعدادات بنجاح",
    failed: language === "en" ? "Update failed" : "فشل التحديث",
    off: language === "en" ? "Off" : "متوقف",
    storeSettings: language === "en" ? "Store Settings" : "إعدادات المتجر",
    storeSettingsDesc:
      language === "en"
        ? "Update store status, name, email, banner, social accounts, and COD."
        : "تحديث حالة المتجر واسم المتجر والبريد والبانر وحسابات التواصل وخيار الدفع عند الاستلام.",

    condition: language === "en" ? "Store condition" : "حالة المتجر",
    chooseCondition: language === "en" ? "Choose store condition" : "اختر حالة المتجر",
    active: language === "en" ? "Active" : "فعال",
    maintenance: language === "en" ? "Maintenance" : "صيانة",

    storeName: language === "en" ? "Store name" : "اسم المتجر",
    storeNamePh: language === "en" ? "Enter store name" : "أدخل اسم المتجر",

    banner: language === "en" ? "Banner Text" : "نص البانر",
    bannerPh: language === "en" ? "Enter banner text (optional)" : "أدخل نص البانر (اختياري)",

    contactTitle: language === "en" ? "Contact & Social" : "التواصل والسوشيال",
    contactHint:
      language === "en"
        ? "Shown to customers (optional). You can use a username or full link."
        : "ستظهر للعملاء (اختياري). يمكنك إدخال اسم المستخدم أو الرابط الكامل.",
    phone: language === "en" ? "Phone number" : "رقم الهاتف",
    phonePh: "+965 5xxxxxxx",
    email: language === "en" ? "Support email" : "بريد الدعم",
    emailPh: language === "en" ? "support@yourstore.com" : "support@yourstore.com",
    twitterX: language === "en" ? "Twitter / X" : "تويتر / X",

    codLabel: language === "en" ? "Cash on Delivery (COD)" : "الدفع عند الاستلام",
    codHint:
      language === "en"
        ? "Turn on/off Cash on Delivery for customers."
        : "تشغيل/إيقاف الدفع عند الاستلام للعملاء.",
    enabled: language === "en" ? "Enabled" : "مفعل",
    disabled: language === "en" ? "Disabled" : "غير مفعل",

    currentTitle: language === "en" ? "Current Store Status" : "حالة المتجر الحالية",
    currentDesc: language === "en" ? "Live status from the server." : "الحالة الحالية من السيرفر.",
    lastUpdated: language === "en" ? "Last updated" : "آخر تحديث",
    statusLabel: language === "en" ? "Status" : "الحالة",
    nameLabel: language === "en" ? "Store" : "المتجر",
    bannerLabel: language === "en" ? "Banner" : "البانر",
    codPreview: language === "en" ? "COD status" : "حالة الدفع عند الاستلام",
    contactPreview: language === "en" ? "Contact preview" : "معاينة التواصل",
    noBanner: language === "en" ? "No banner" : "لا يوجد",
    na: language === "en" ? "N/A" : "غير متوفر",
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

  const handleUpdateStoreStatus = async (): Promise<void> => {
    try {
      await updateStoreStatus({
        status,
        storeName: storeName.trim(),
        email: email.trim(),
        banner: banner.trim(),
        phoneNumber: phoneNumber.trim(),
        instagram: instagram.trim(),
        twitter: twitter.trim(),
        tiktok: tiktok.trim(),
        cashOnDeliveryEnabled,
      }).unwrap?.();

      toast.success(t.updated);
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.message || t.failed);
    }
  };

  useEffect(() => {
    if (!current) return;

    setStatus(current?.status || "");
    setStoreName(current?.storeName || "");
    setEmail(current?.email || "");

    setBanner(current?.banner || "");
    setPhoneNumber(current?.phoneNumber || "");
    setInstagram(current?.instagram || "");
    setTwitter(current?.twitter || "");
    setTiktok(current?.tiktok || "");

    setCashOnDeliveryEnabled(
      typeof current?.cashOnDeliveryEnabled === "boolean" ? current.cashOnDeliveryEnabled : true,
    );
  }, [current]);

  // ✅ dark mode added everywhere
  const bentoCard =
    "rounded-3xl border border-black/10 bg-white/80 backdrop-blur shadow-sm dark:border-white/10 dark:bg-zinc-950/80";
  const pill =
    "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition drop-shadow-[0_1px_1px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-white/5";
  const input =
    "w-full px-4 py-2.5 border border-black/10 outline-0 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 bg-white text-zinc-900 placeholder:text-zinc-400 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500";
  const hint = "mt-1 text-xs text-zinc-500 dark:text-zinc-400";

  const Switch = ({
    checked,
    onChange,
    label,
    icon,
    hintText,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    icon: ReactNode;
    hintText?: string;
  }) => {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {icon}
              <div className="text-sm font-bold text-zinc-900 dark:text-white">{label}</div>
            </div>
            {hintText ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hintText}</p>
            ) : null}
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span
              className={clsx(
                "w-12 h-7 rounded-full transition border",
                checked
                  ? "bg-emerald-600 border-emerald-600"
                  : "bg-zinc-200 border-zinc-200 dark:bg-white/10 dark:border-white/10",
              )}
            />
            <span
              className={clsx(
                "absolute top-0.5 left-0.5 h-6 w-6 rounded-full shadow transition",
                "bg-white dark:bg-zinc-200",
                checked ? "translate-x-5" : "translate-x-0",
              )}
            />
          </label>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div
        dir={language === "ar" ? "rtl" : "ltr"}
        className="px-4 w-full max-w-4xl min-h-screen py-6 mt-[50px] text-zinc-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-800 dark:text-white">{t.settings}</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.desc}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => dispatch(toggleLang())} className={pill}>
              <Globe className="w-4 h-4 text-blue-500" />
              <span>{language === "en" ? "العربية" : "English"}</span>
            </button>
            <ThemeToggle />
          </div>
        </div>

        <Separator className="my-4 bg-black/10 dark:bg-white/10" />

        <div className="flex flex-col gap-4">
          {/* Update card */}
          <section className={`${bentoCard} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-zinc-900 text-white grid place-items-center dark:bg-white dark:text-zinc-900">
                  <StoreIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-zinc-900 dark:text-white">
                    {t.storeSettings}
                  </h2>
                </div>
              </div>

              <button
                onClick={handleUpdateStoreStatus}
                disabled={loadingUpdateStatus}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition",
                  "bg-neutral-950 text-white hover:bg-neutral-900",
                  "dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
                )}>
                <Save className="size-4" />
                {t.save}
                {loadingUpdateStatus ? <Loader2Icon className="animate-spin h-4 w-4" /> : null}
              </button>
            </div>

            <Separator className="my-4 bg-black/10 dark:bg-white/10" />

            <div className="grid grid-cols-2 gap-3">
              {/* Condition */}
              <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                  <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {t.condition}
                  </label>
                </div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={clsx(input, "cursor-pointer")}>
                  <option value="" disabled>
                    {t.chooseCondition}
                  </option>
                  <option value="active">{t.active}</option>
                  <option value="maintenance">{t.maintenance}</option>
                  <option value="off">{t.off}</option>
                </select>
              </div>

              {/* Store name */}
              <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                  <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {t.storeName}
                  </label>
                </div>
                <input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder={t.storeNamePh}
                  className={input}
                />
              </div>

              {/* Banner */}
              <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                  <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {t.banner}
                  </label>
                </div>
                <textarea
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  rows={3}
                  placeholder={t.bannerPh}
                  className={clsx(input, "resize-none")}
                />
              </div>

              {/* COD switch */}
              <Switch
                checked={cashOnDeliveryEnabled}
                onChange={setCashOnDeliveryEnabled}
                label={t.codLabel}
                icon={<Banknote className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />}
                hintText={t.codHint}
              />

              {/* Contact & Social */}
              <div className="rounded-2xl col-span-full border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {t.contactTitle}
                </h3>
                <p className={hint}>{t.contactHint}</p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                      <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {t.phone}
                      </label>
                    </div>
                    <input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={t.phonePh}
                      className={input}
                    />
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                      <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {t.email}
                      </label>
                    </div>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPh}
                      inputMode="email"
                      className={input}
                    />
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Instagram className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                      <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        Instagram
                      </label>
                    </div>
                    <input
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder={
                        language === "en"
                          ? "@yourstore or instagram.com/yourstore"
                          : "@متجرك أو instagram.com/yourstore"
                      }
                      className={input}
                    />
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Twitter className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                      <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {t.twitterX}
                      </label>
                    </div>
                    <input
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder={
                        language === "en"
                          ? "@yourstore or x.com/yourstore"
                          : "@متجرك أو x.com/yourstore"
                      }
                      className={input}
                    />
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-3 sm:col-span-2 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Music2 className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                      <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        TikTok
                      </label>
                    </div>
                    <input
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                      placeholder={
                        language === "en"
                          ? "@yourstore or tiktok.com/@yourstore"
                          : "@متجرك أو tiktok.com/@yourstore"
                      }
                      className={input}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Preview card */}
          <section className={`${bentoCard} p-5`}>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-zinc-900 text-white grid place-items-center dark:bg-white dark:text-zinc-900">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-zinc-900 dark:text-white">
                  {t.currentTitle}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.currentDesc}</p>
              </div>
            </div>

            <Separator className="my-4 bg-black/10 dark:bg-white/10" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Store Name beside Store Status */}
              <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {t.nameLabel}
                </span>
                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black dark:border-t-white" />
                  </div>
                ) : (
                  <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                    {current?.storeName?.trim() || "—"}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {t.statusLabel}
                </span>
                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black dark:border-t-white" />
                  </div>
                ) : current?.status === "active" ? (
                  <p className="mt-1 font-semibold text-teal-600">{t.active}</p>
                ) : current?.status === "maintenance" ? (
                  <p className="mt-1 font-semibold text-rose-600">{t.maintenance}</p>
                ) : (
                  <p className="mt-1 font-semibold text-orange-600">{t.off}</p>
                )}
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {t.lastUpdated}
                </span>
                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black dark:border-t-white" />
                  </div>
                ) : (
                  <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                    {formatDate(current?.updatedAt)}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {t.codPreview}
                </span>
                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black dark:border-t-white" />
                  </div>
                ) : (
                  <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                    {current?.cashOnDeliveryEnabled ? t.enabled : t.disabled}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-4 sm:col-span-2 dark:border-white/10 dark:bg-zinc-950">
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {t.bannerLabel}
                </span>
                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black dark:border-t-white" />
                  </div>
                ) : (
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold text-zinc-900 dark:text-white">
                    {current?.banner?.trim() ? current.banner : t.noBanner}
                  </p>
                )}
              </div>

              {/* Contact preview */}
              <div className="rounded-2xl border border-black/10 bg-white p-4 sm:col-span-2 dark:border-white/10 dark:bg-zinc-950">
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {t.contactPreview}
                </span>
                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black dark:border-t-white" />
                  </div>
                ) : (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <PreviewRow
                      label={language === "en" ? "Phone" : "الهاتف"}
                      value={current?.phoneNumber}
                    />
                    <PreviewRow label={t.email} value={current?.email} />
                    <PreviewRow label="Instagram" value={current?.instagram} />
                    <PreviewRow label="Twitter / X" value={current?.twitter} />
                    <PreviewRow label="TikTok" value={current?.tiktok} />
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

function PreviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span
        className={clsx(
          "font-semibold text-zinc-900 dark:text-white",
          !value && "text-zinc-400 dark:text-zinc-500",
        )}>
        {value?.trim() ? value : "—"}
      </span>
    </div>
  );
}

export default Settings;
