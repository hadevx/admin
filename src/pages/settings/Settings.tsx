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
  Palette,
} from "lucide-react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import ThemePicker from "../../components/ThemePicker";

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

    appearance: language === "en" ? "Appearance" : "المظهر",
    appearanceDesc:
      language === "en"
        ? "Pick a colour scheme for the dashboard. Saved on this device only."
        : "اختر نظام ألوان للوحة التحكم. يُحفظ على هذا الجهاز فقط.",
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

  // Shared surface/control styles now come from the design system in index.css
  const bentoCard = "ws-card";
  const input = "ws-input";
  const hint = "mt-1 text-xs text-muted-foreground";

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
      <div className="ws-tile">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {icon}
              <div className="text-sm font-bold">{label}</div>
            </div>
            {hintText ? <p className="mt-1 text-xs text-muted-foreground">{hintText}</p> : null}
          </div>

          <label className="relative inline-flex shrink-0 cursor-pointer select-none items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span
              className={clsx(
                "h-7 w-12 rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring/60",
                checked
                  ? "border-emerald-600 bg-emerald-600"
                  : "border-border bg-muted dark:bg-white/10",
              )}
            />
            <span
              className={clsx(
                "absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform",
                checked ? "start-0.5 translate-x-5 rtl:-translate-x-5" : "start-0.5 translate-x-0",
              )}
            />
          </label>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="me-auto w-full max-w-4xl animate-fade-up">
        {/* Header — language and theme live in the top bar */}
        <div className="mb-4">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{t.settings}</h1>
          <p className="text-sm text-muted-foreground">{t.desc}</p>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col gap-4">
          {/* Appearance — device-local, so it saves instantly with no Save button */}
          <section className={`${bentoCard} p-5`}>
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-emphasis text-emphasis-foreground">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-foreground">{t.appearance}</h2>
                <p className="text-sm text-muted-foreground">{t.appearanceDesc}</p>
              </div>
            </div>

            <Separator className="my-4 bg-border" />

            <ThemePicker language={language} />
          </section>

          {/* Update card */}
          <section className={`${bentoCard} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-emphasis text-emphasis-foreground">
                  <StoreIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-foreground">
                    {t.storeSettings}
                  </h2>
                </div>
              </div>

              <button
                onClick={handleUpdateStoreStatus}
                disabled={loadingUpdateStatus}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition",
                  "bg-emphasis text-emphasis-foreground hover:bg-emphasis-hover",
                )}>
                <Save className="size-4" />
                {t.save}
                {loadingUpdateStatus ? <Loader2Icon className="animate-spin h-4 w-4" /> : null}
              </button>
            </div>

            <Separator className="my-4 bg-border" />

            <div className="grid grid-cols-2 gap-3">
              {/* Condition */}
              <div className="ws-tile">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-semibold text-foreground">
                    {t.condition}
                  </label>
                </div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="ws-select">
                  <option value="" disabled>
                    {t.chooseCondition}
                  </option>
                  <option value="active">{t.active}</option>
                  <option value="maintenance">{t.maintenance}</option>
                  <option value="off">{t.off}</option>
                </select>
              </div>

              {/* Store name */}
              <div className="ws-tile">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-semibold text-foreground">
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
              <div className="ws-tile">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-semibold text-foreground">
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
                icon={<Banknote className="h-4 w-4 text-muted-foreground" />}
                hintText={t.codHint}
              />

              {/* Contact & Social */}
              <div className="ws-tile col-span-full">
                <h3 className="text-sm font-bold text-foreground">
                  {t.contactTitle}
                </h3>
                <p className={hint}>{t.contactHint}</p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="ws-tile p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-semibold text-foreground">
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

                  <div className="ws-tile p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-semibold text-foreground">
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

                  <div className="ws-tile p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Instagram className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-semibold text-foreground">
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

                  <div className="ws-tile p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Twitter className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-semibold text-foreground">
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
                      <Music2 className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-semibold text-foreground">
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
              <div className="grid size-11 place-items-center rounded-2xl bg-emphasis text-emphasis-foreground">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-foreground">
                  {t.currentTitle}
                </h2>
                <p className="text-sm text-muted-foreground">{t.currentDesc}</p>
              </div>
            </div>

            <Separator className="my-4 bg-border" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Store Name beside Store Status */}
              <div className="ws-tile">
                <span className="block text-xs text-muted-foreground">
                  {t.nameLabel}
                </span>
                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black dark:border-t-white" />
                  </div>
                ) : (
                  <p className="mt-1 font-semibold text-foreground">
                    {current?.storeName?.trim() || "—"}
                  </p>
                )}
              </div>

              <div className="ws-tile">
                <span className="block text-xs text-muted-foreground">
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

              <div className="ws-tile">
                <span className="block text-xs text-muted-foreground">
                  {t.lastUpdated}
                </span>
                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black dark:border-t-white" />
                  </div>
                ) : (
                  <p className="mt-1 font-semibold text-foreground">
                    {formatDate(current?.updatedAt)}
                  </p>
                )}
              </div>

              <div className="ws-tile">
                <span className="block text-xs text-muted-foreground">
                  {t.codPreview}
                </span>
                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black dark:border-t-white" />
                  </div>
                ) : (
                  <p className="mt-1 font-semibold text-foreground">
                    {current?.cashOnDeliveryEnabled ? t.enabled : t.disabled}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-4 sm:col-span-2 dark:border-white/10 dark:bg-zinc-950">
                <span className="block text-xs text-muted-foreground">
                  {t.bannerLabel}
                </span>
                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black dark:border-t-white" />
                  </div>
                ) : (
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold text-foreground">
                    {current?.banner?.trim() ? current.banner : t.noBanner}
                  </p>
                )}
              </div>

              {/* Contact preview */}
              <div className="rounded-2xl border border-black/10 bg-white p-4 sm:col-span-2 dark:border-white/10 dark:bg-zinc-950">
                <span className="block text-xs text-muted-foreground">
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
      <span className="text-muted-foreground">{label}</span>
      <span
        className={clsx(
          "font-semibold text-foreground",
          !value && "text-muted-foreground",
        )}>
        {value?.trim() ? value : "—"}
      </span>
    </div>
  );
}

export default Settings;
