import Layout from "../../Layout";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";
import { Separator } from "../../components/ui/separator";
import PageHeader from "@/components/PageHeader";
import {
  Loader2Icon,
  Truck,
  Clock3,
  Coins,
  ShieldCheck,
  Wrench,
  BadgeDollarSign,
  Save,
} from "lucide-react";
import { useSelector } from "react-redux";
import clsx from "clsx";

import {
  useGetDeliveryStatusQuery,
  useUpdateDeliverySettingsMutation,
} from "../../redux/queries/deliveryApi";
import { labels } from "./translation";

import { type RootState, type ZoneFee, type DeliveryStatusItem } from "./types";

function Delivery() {
  const language = useSelector((state: RootState) => state.language.lang);

  const GOVERNORATES = useMemo(
    () => [
      { value: "Al Asimah", en: "Al Asimah (Capital)", ar: "العاصمة" },
      { value: "Hawalli", en: "Hawalli", ar: "حولي" },
      { value: "Farwaniya", en: "Farwaniya", ar: "الفروانية" },
      { value: "Ahmadi", en: "Ahmadi", ar: "الأحمدي" },
      { value: "Mubarak Al-Kabeer", en: "Mubarak Al-Kabeer", ar: "مبارك الكبير" },
      { value: "Jahra", en: "Jahra", ar: "الجهراء" },
    ],
    [],
  );

  const t = labels[language] || labels.en;

  const ETA_OPTIONS = useMemo(
    () => [
      { value: "very fast (1-2hr)", label: t.eta_1_2h },
      { value: "fast (2-4h)", label: t.eta_2_4h },
      { value: "same day", label: t.eta_same_day },
      { value: "next day", label: t.eta_next_day },
      { value: "2 days", label: t.eta_2_days },
      { value: "3-5 days", label: t.eta_3_5_days },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language],
  );

  const [timeToDeliver, setTimeToDeliver] = useState<string>("");
  const [shippingFee, setShippingFee] = useState<string>("");
  const [minDeliveryCost, setMinDeliveryCost] = useState<string>("");

  // ✅ default OFF, but auto-enable if server has active values
  const [enableFreeThreshold, setEnableFreeThreshold] = useState<boolean>(false);
  const [enableZones, setEnableZones] = useState<boolean>(false);

  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<string>("0");
  const [zoneFees, setZoneFees] = useState<Array<{ id: string; zone: string; fee: string }>>([]);

  // ✅ to avoid overriding user toggle after they manually change it
  const [togglesTouched, setTogglesTouched] = useState({ free: false, zones: false });

  const {
    data: deliveryStatus,
    refetch,
    isLoading,
  } = useGetDeliveryStatusQuery(undefined) as {
    data?: DeliveryStatusItem[];
    refetch: () => void;
    isLoading: boolean;
  };

  const [updateDeliverySettings, { isLoading: loadingUpdateDelivery }] =
    useUpdateDeliverySettingsMutation();

  const current = deliveryStatus?.[0];

  const normalizeTimeValue = (v?: string) => {
    if (!v) return "";
    if (v === "today") return "same day";
    if (v === "tomorrow") return "next day";
    if (v === "two days") return "2 days";
    return v;
  };

  // ✅ Prefill values + auto-enable toggles based on server ACTIVE values
  useEffect(() => {
    if (!current) return;

    setTimeToDeliver((prev) => (prev ? prev : normalizeTimeValue(current?.timeToDeliver)));
    setShippingFee((prev) => (prev !== "" ? prev : String(current?.shippingFee ?? "")));
    setMinDeliveryCost((prev) => (prev !== "" ? prev : String(current?.minDeliveryCost ?? "")));

    setFreeDeliveryThreshold((prev) =>
      prev !== "0" && prev !== "" ? prev : String(Number(current?.freeDeliveryThreshold ?? 0)),
    );

    setZoneFees((prev) => {
      if (prev.length) return prev;
      const fromApi = current?.zoneFees || [];
      if (fromApi.length) {
        return fromApi.map((z, idx) => ({
          id: `${Date.now()}_${idx}`,
          zone: z.zone || "",
          fee: typeof z.fee === "number" ? String(z.fee) : "",
        }));
      }
      return [];
    });

    // ✅ AUTO-enable after refresh if values are active in DB
    const serverFreeOn = Number(current?.freeDeliveryThreshold ?? 0) > 0;
    const serverZonesOn = (current?.zoneFees?.length || 0) > 0;

    if (!togglesTouched.free) setEnableFreeThreshold(serverFreeOn);
    if (!togglesTouched.zones) setEnableZones(serverZonesOn);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const safeNumber = (v: string, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const handleUpdateDelivery = async () => {
    try {
      const cleanedZones: ZoneFee[] = enableZones
        ? zoneFees
            .map((z) => ({
              zone: (z.zone || "").trim(),
              fee: safeNumber(z.fee, NaN as any),
            }))
            .filter((z) => z.zone && typeof z.fee === "number" && Number.isFinite(z.fee))
        : [];

      const thresholdNumber = enableFreeThreshold ? safeNumber(freeDeliveryThreshold, 0) : 0;

      await updateDeliverySettings({
        timeToDeliver,
        shippingFee: safeNumber(shippingFee, 0),
        minDeliveryCost: safeNumber(minDeliveryCost, 0),
        freeDeliveryThreshold: thresholdNumber,
        zoneFees: cleanedZones,
      }).unwrap?.();

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
    const v = normalizeTimeValue(current?.timeToDeliver);
    const match = ETA_OPTIONS.find((o) => o.value === v);
    return match?.label || v || "—";
  };

  const money = (n?: number) => {
    if (typeof n !== "number") return "—";
    return `${n.toFixed(3)} ${language === "ar" ? "دك" : "KD"}`;
  };

  // Shared surface/control styles come from the design system in index.css
  const bentoCard = "ws-card";
  const input = "ws-input";

  const getGovernorateLabel = (value: string) => {
    const gov = GOVERNORATES.find((g) => g.value === value);
    if (!gov) return value || "—";
    return language === "ar" ? gov.ar : gov.en;
  };

  // ✅ mobile-like toggle switch (dark mode added)
  const Switch = ({
    checked,
    onChange,
    label,
    icon,
    hint,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    icon: React.ReactNode;
    hint?: string;
  }) => (
    <div className="ws-tile">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon}
            <div className="text-sm font-bold text-foreground">{label}</div>
          </div>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
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

  return (
    <Layout>
      <div className="me-auto w-full max-w-5xl animate-fade-up">
        {/* Header */}
        <PageHeader title={t.pageTitle} subtitle={t.pageDesc} icon={Truck} />

        <Separator className="my-4" />

        <div className="flex flex-col gap-4">
          {/* Update card */}
          <section className={`${bentoCard} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-emphasis text-emphasis-foreground">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-foreground">
                    {t.updateSettings}
                  </h2>
                </div>
              </div>

              <button
                onClick={handleUpdateDelivery}
                disabled={loadingUpdateDelivery}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition",
                  "bg-emphasis text-emphasis-foreground hover:bg-emphasis-hover",
                )}>
                <Save className="size-4" />
                {t.updateBtn}
                {loadingUpdateDelivery ? <Loader2Icon className="animate-spin h-4 w-4" /> : null}
              </button>
            </div>

            <Separator className="my-4 bg-border" />

            <div className="grid grid-cols-1 gap-3">
              {/* ETA */}
              <div className="ws-tile">
                <div className="flex items-center gap-2 mb-2">
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-semibold text-foreground">
                    {t.timeToDeliver}
                  </label>
                </div>
                <select
                  onChange={(e) => setTimeToDeliver(e.target.value)}
                  value={timeToDeliver}
                  className="ws-select">
                  <option value="" disabled>
                    {t.chooseTime}
                  </option>
                  {ETA_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Default Shipping fee */}
              <div className="ws-tile">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-semibold text-foreground">
                    {t.shippingFee}
                  </label>
                </div>
                <select
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                  className="ws-select">
                  <option value="" disabled>
                    {t.chooseFee}
                  </option>
                  {[0, 1, 2, 3, 4, 5].map((fee) => (
                    <option key={fee} value={fee}>
                      {fee === 0 ? t.free : `${fee}.000 ${language === "ar" ? "دك" : "KD"}`}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t.useDefaultIfNotFound}
                </p>
              </div>

              {/* Min */}
              <div className="ws-tile">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-semibold text-foreground">
                    {t.minDeliveryCost}
                  </label>
                </div>
                <select
                  value={minDeliveryCost}
                  onChange={(e) => setMinDeliveryCost(e.target.value)}
                  className="ws-select">
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

              {/* Switch: Free threshold */}
              <Switch
                checked={enableFreeThreshold}
                onChange={(v) => {
                  setTogglesTouched((p) => ({ ...p, free: true }));
                  setEnableFreeThreshold(v);
                }}
                label={t.enableFreeThreshold}
                icon={<BadgeDollarSign className="h-4 w-4 text-muted-foreground" />}
                hint={t.freeThresholdHint}
              />

              {enableFreeThreshold && (
                <div className="ws-tile">
                  <div className="flex items-center gap-2 mb-2">
                    <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-semibold text-foreground">
                      {t.freeThresholdLabel}
                    </label>
                  </div>

                  <input
                    value={freeDeliveryThreshold}
                    onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                    inputMode="decimal"
                    placeholder="0"
                    className={clsx(input)}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">{t.exampleFree}</p>
                </div>
              )}
            </div>
          </section>

          {/* Preview */}
          <section className={`${bentoCard} p-5`}>
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-emphasis text-emphasis-foreground">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-foreground">
                  {t.currentStatus}
                </h2>
                <p className="text-sm text-muted-foreground">{t.live}</p>
              </div>
            </div>

            <Separator className="my-4 bg-border" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PreviewTile label={t.timeToDeliver} loading={isLoading} value={renderTime()} />

              <PreviewTile
                label={t.shippingFee}
                loading={isLoading}
                value={
                  current?.shippingFee === 0
                    ? t.free
                    : typeof current?.shippingFee === "number"
                      ? money(current.shippingFee)
                      : "—"
                }
              />

              <PreviewTile
                label={t.minDeliveryCost}
                loading={isLoading}
                value={
                  current?.minDeliveryCost === 0
                    ? t.noMinimum
                    : typeof current?.minDeliveryCost === "number"
                      ? money(current.minDeliveryCost)
                      : "—"
                }
              />

              <PreviewTile
                label={t.lastUpdated}
                loading={isLoading}
                value={formatDate(current?.updatedAt)}
              />

              <div className="rounded-2xl border border-black/10 bg-white p-4 sm:col-span-2 dark:border-white/10 dark:bg-zinc-950">
                <span className="block text-xs text-muted-foreground">
                  {t.freeThresholdTitle}
                </span>
                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black dark:border-t-white" />
                  </div>
                ) : (
                  <p className="mt-1 font-semibold text-foreground">
                    {current?.freeDeliveryThreshold && current.freeDeliveryThreshold > 0
                      ? `${language === "en" ? "Free above" : "مجاني فوق"} ${money(
                          current.freeDeliveryThreshold,
                        )}`
                      : "—"}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-4 sm:col-span-2 dark:border-white/10 dark:bg-zinc-950">
                <span className="block text-xs text-muted-foreground">
                  {t.zonesTitle}
                </span>

                {isLoading ? (
                  <div className="mt-2">
                    <Spinner className="border-t-black dark:border-t-white" />
                  </div>
                ) : (current?.zoneFees?.length || 0) > 0 ? (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {current!.zoneFees!.slice(0, 12).map((z, idx) => (
                      <div
                        key={`${z.zone}_${idx}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                        <span className="text-sm text-zinc-600 dark:text-zinc-300">
                          {getGovernorateLabel(z.zone)}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {money(z.fee)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">{t.noZones}</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

function PreviewTile({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="ws-tile">
      <span className="block text-xs text-muted-foreground">{label}</span>
      {loading ? (
        <div className="mt-2">
          <Spinner className="border-t-black dark:border-t-white" />
        </div>
      ) : (
        <p className="mt-1 font-semibold text-foreground">{value}</p>
      )}
    </div>
  );
}

export default Delivery;
