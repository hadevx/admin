import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { useSelector } from "react-redux";
import Layout from "../../Layout";
import Loader from "../../components/Loader";
import { useGetGovernorateQuery } from "@/redux/queries/userApi";
import { useGetOrderStatsQuery, useGetRevenuStatsQuery } from "../../redux/queries/orderApi";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  LabelList,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  ShoppingBag,
  Wallet,
  Eye,
  EyeOff,
  Filter,
  Info,
  Printer,
  RefreshCw,
  Table2,
  Copy,
} from "lucide-react";
import clsx from "clsx";

type RootState = {
  language: { lang: "en" | "ar" };
};

type ActiveChart = "users" | "orders" | "revenue";
type ChartType = "pie" | "line" | "bar";
type SortBy = "value_desc" | "value_asc" | "label_asc" | "label_desc";
type Range = "all" | "top5" | "top10";

type Normalization = "raw" | "percent";
type ViewMode = "chart" | "table";

const SummaryCharts = (): JSX.Element => {
  const {
    data: usersData,
    isLoading: loadingUsers,
    refetch: refetchUsers,
  } = useGetGovernorateQuery<any>(undefined);

  const {
    data: orderStats,
    isLoading: loadingOrders,
    refetch: refetchOrders,
  } = useGetOrderStatsQuery<any>(undefined);

  const {
    data: revenuStats,
    isLoading: loadingRevenue,
    refetch: refetchRevenue,
  } = useGetRevenuStatsQuery<any>(undefined);

  const language = useSelector((state: RootState) => state.language.lang);
  const isRTL = language === "ar";

  const [activeChart, setActiveChart] = useState<ActiveChart>("users");
  const [chartType, setChartType] = useState<ChartType>("pie");
  const [viewMode, setViewMode] = useState<ViewMode>("chart");

  // controls
  const [range, setRange] = useState<Range>("all");
  const [sortBy, setSortBy] = useState<SortBy>("value_desc");
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  // features used in UI/logic
  const [normalization, setNormalization] = useState<Normalization>("raw");
  const [minSlicePercent, setMinSlicePercent] = useState<number>(4);

  // last updated
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const firstLoadRef = useRef(true);

  const isLoading = loadingUsers || loadingOrders || loadingRevenue;

  useEffect(() => {
    if (!isLoading) {
      setLastUpdatedAt(new Date());
      if (firstLoadRef.current) firstLoadRef.current = false;
    }
  }, [isLoading]);

  const refreshNow = () => {
    refetchUsers?.();
    refetchOrders?.();
    refetchRevenue?.();
    setLastUpdatedAt(new Date());
  };

  // Arabic governorate extraction
  const arabicOnly = useMemo(() => {
    return (
      usersData?.governorates?.map((item: any) => {
        const match = String(item.governorate || "").match(/[\u0600-\u06FF].*/);
        return { ...item, governorate: match ? match[0].trim() : item.governorate };
      }) || []
    );
  }, [usersData]);

  // Summary cards
  const summaryStats = useMemo(
    () => [
      {
        key: "users",
        icon: Users,
        title: { en: "Total Users", ar: "المستخدمين" },
        value: usersData?.totalUsers ?? 0,
      },
      {
        key: "orders",
        icon: ShoppingBag,
        title: { en: "Total Orders", ar: "الطلبات" },
        value: orderStats?.total ?? 0,
      },
      {
        key: "revenue",
        icon: Wallet,
        title: { en: "Total Revenue", ar: "الإيرادات" },
        value: `${(revenuStats?.totalRevenue ?? 0).toFixed(3)} KD`,
      },
    ],
    [usersData, orderStats, revenuStats],
  );

  // Chart data
  const usersChartData = useMemo(
    () =>
      arabicOnly.map((gov: any) => ({
        label: gov.governorate || "",
        value: gov.count || 0,
      })),
    [arabicOnly],
  );

  const ordersChartData = useMemo(() => {
    if (!orderStats) return [];
    return [
      { label: isRTL ? "تم التوصيل" : "Delivered", value: orderStats.delivered || 0 },
      { label: isRTL ? "ملغي" : "Canceled", value: orderStats.canceled || 0 },
      { label: isRTL ? "قيد التنفيذ" : "Processing", value: orderStats.processing || 0 },
    ];
  }, [orderStats, isRTL]);

  const revenueChartData = useMemo(
    () =>
      revenuStats?.monthly?.map((item: any) => ({
        label: new Date(2025, item._id - 1).toLocaleString(isRTL ? "ar" : "en", { month: "short" }),
        value: item.totalRevenue || 0,
      })) || [],
    [revenuStats, isRTL],
  );

  const rawChartData =
    activeChart === "users"
      ? usersChartData
      : activeChart === "orders"
        ? ordersChartData
        : revenueChartData;

  const unit =
    activeChart === "revenue"
      ? "KD"
      : activeChart === "orders"
        ? isRTL
          ? "طلب"
          : "orders"
        : isRTL
          ? "مستخدم"
          : "users";

  // search + sort + topN
  const filteredSortedData = useMemo(() => {
    let next = [...rawChartData];

    if (search.trim()) {
      const q = search.toLowerCase();
      next = next.filter((d: any) =>
        String(d.label || "")
          .toLowerCase()
          .includes(q),
      );
    }

    switch (sortBy) {
      case "value_asc":
        next.sort((a: any, b: any) => (a.value ?? 0) - (b.value ?? 0));
        break;
      case "value_desc":
        next.sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0));
        break;
      case "label_asc":
        next.sort((a: any, b: any) => String(a.label).localeCompare(String(b.label)));
        break;
      case "label_desc":
        next.sort((a: any, b: any) => String(b.label).localeCompare(String(a.label)));
        break;
    }

    if (range === "top5") next = next.slice(0, 5);
    if (range === "top10") next = next.slice(0, 10);

    return next;
  }, [rawChartData, search, sortBy, range]);

  // stats + normalization helpers
  const rawTotal = useMemo(() => {
    const values = filteredSortedData.map((d: any) => Number(d.value) || 0);
    return values.reduce((a: number, b: number) => a + b, 0);
  }, [filteredSortedData]);

  const totalSafe = rawTotal || 1;

  const chartData = useMemo(() => {
    if (normalization !== "percent") return filteredSortedData;

    return filteredSortedData.map((d: any) => ({
      ...d,
      value: (Number(d.value) || 0) / totalSafe,
      __raw: Number(d.value) || 0,
    }));
  }, [filteredSortedData, normalization, totalSafe]);

  const chartStats = useMemo(() => {
    const values = filteredSortedData.map((d: any) => Number(d.value) || 0);
    const total = values.reduce((a: number, b: number) => a + b, 0);

    const max = values.length ? Math.max(...values) : 0;
    const min = values.length ? Math.min(...values) : 0;
    const avg = values.length ? total / values.length : 0;

    return { total, count: values.length, max, min, avg };
  }, [filteredSortedData]);

  const chartTitle =
    activeChart === "users"
      ? isRTL
        ? "توزيع المستخدمين حسب المحافظة"
        : "Users by Governorate"
      : activeChart === "orders"
        ? isRTL
          ? "توزيع الطلبات حسب الحالة"
          : "Orders by Status"
        : isRTL
          ? "الإيرادات الشهرية"
          : "Monthly Revenue";

  const chartDesc =
    activeChart === "users"
      ? isRTL
        ? "المستخدمون الحاليون لكل محافظة"
        : "Current users per governorate"
      : activeChart === "orders"
        ? isRTL
          ? "عدد الطلبات حسب الحالة"
          : "Number of orders by status"
        : isRTL
          ? "الإيرادات لكل شهر"
          : "Revenue per month";

  const money = (n?: number) => {
    if (typeof n !== "number") return "—";
    return `${n.toFixed(3)} ${language === "ar" ? "دك" : "KD"}`;
  };

  const formatTooltip = (value: any, _name?: any, payload?: any) => {
    if (normalization === "percent") {
      const pct = Number(value) * 100;
      const raw = payload?.payload?.__raw;
      const rawText =
        typeof raw === "number"
          ? activeChart === "revenue"
            ? `${raw.toFixed(3)} KD`
            : `${Math.round(raw)} ${unit}`
          : "";
      return [`${pct.toFixed(1)}% ${rawText ? `• ${rawText}` : ""}`, ""];
    }

    if (activeChart === "revenue") return `${Number(value).toFixed(3)} ${unit}`;
    return `${value} ${unit}`;
  };

  const formatValue = (v: any) => {
    if (normalization === "percent") return `${(Number(v) * 100).toFixed(1)}%`;
    return activeChart === "revenue" ? Number(v).toFixed(3) : v;
  };

  // Pie colors
  const PIE_COLORS = [
    "#FF6B6B",
    "#4D96FF",
    "#6BCB77",
    "#FFD93D",
    "#845EC2",
    "#00C9A7",
    "#FF9671",
    "#2C73D2",
    "#C34A36",
    "#0081CF",
    "#F9F871",
  ];

  const renderPieLabel = (entry: any) => {
    const valRaw =
      normalization === "percent" ? (Number(entry?.value) || 0) * 100 : Number(entry?.value) || 0;

    const pct =
      normalization === "percent" ? valRaw : ((Number(entry?.value) || 0) / totalSafe) * 100;

    if (pct < minSlicePercent) return "";
    return `${pct.toFixed(0)}%`;
  };

  const legendLabel = isRTL
    ? activeChart === "users"
      ? "المستخدمون"
      : activeChart === "orders"
        ? "الطلبات"
        : "الإيرادات"
    : activeChart === "users"
      ? "Users"
      : activeChart === "orders"
        ? "Orders"
        : "Revenue";

  const StatChip = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="text-xs text-neutral-500 dark:text-neutral-400">{label}</div>
      <div className="mt-1 text-base font-semibold text-neutral-950 dark:text-neutral-50">
        {value}
      </div>
    </div>
  );

  const ChipBtn = ({
    active,
    onClick,
    children,
  }: {
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
        "border-neutral-200 text-neutral-900",
        "dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800/70",
        active
          ? "border-neutral-950 bg-neutral-950 text-white dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950"
          : "",
      )}>
      {children}
    </button>
  );

  const copySummary = async () => {
    const totalText =
      activeChart === "revenue"
        ? `${chartStats.total.toFixed(3)} KD`
        : `${Math.round(chartStats.total)} ${unit}`;

    const lines = [
      `${chartTitle}`,
      `${isRTL ? "المجموع" : "Total"}: ${totalText}`,
      `${isRTL ? "العناصر" : "Items"}: ${chartStats.count}`,
      "",
      ...filteredSortedData.map((d: any) => `- ${d.label}: ${d.value}`),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(lines);
    } catch {
      // silent (some browsers block)
    }
  };

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div
          className={clsx(
            "w-full px-4 py-6 mt-[70px] max-w-6xl",
            isRTL ? "rtl" : "ltr",
            "text-neutral-950 dark:text-neutral-50",
          )}>
          {/* Header */}
          <div
            className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
            dir={isRTL ? "rtl" : "ltr"}>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                {isRTL ? "لوحة الإحصائيات" : "Summary Dashboard"}
              </h1>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {isRTL ? "نظرة عامة + ميزات تصفية." : "Overview + filters."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <span className="inline-flex items-center gap-2">
                <Info className="h-4 w-4" />
                {isRTL ? "آخر تحديث:" : "Last update:"}{" "}
                {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString(isRTL ? "ar" : "en") : "—"}
              </span>

              <button
                type="button"
                onClick={refreshNow}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
                  "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                  "dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800/70",
                )}>
                <RefreshCw className="h-4 w-4" />
                {isRTL ? "تحديث" : "Refresh"}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
                  "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                  "dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800/70",
                )}>
                <Printer className="h-4 w-4" />
                {isRTL ? "طباعة" : "Print"}
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {summaryStats.map((s) => {
              const Icon = s.icon;
              const isActive = activeChart === (s.key as ActiveChart);
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActiveChart(s.key as ActiveChart)}
                  className={clsx(
                    "text-left rounded-3xl border backdrop-blur shadow-sm transition",
                    "border-neutral-200 bg-white/80 hover:bg-white",
                    "dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:bg-neutral-900/80",
                    isActive
                      ? "border-neutral-950 ring-2 ring-neutral-950/10 dark:border-neutral-200 dark:ring-neutral-200/10"
                      : "",
                  )}>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div
                        className={clsx(
                          "inline-flex h-11 w-11 items-center justify-center rounded-2xl border",
                          "border-neutral-200 bg-neutral-50",
                          "dark:border-neutral-800 dark:bg-neutral-800/70",
                        )}>
                        <Icon className="h-5 w-5 text-neutral-900 dark:text-neutral-50" />
                      </div>
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        {isRTL ? "إجمالي" : "TOTAL"}
                      </span>
                    </div>

                    <div className="mt-3 text-2xl sm:text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
                      {s.value}
                    </div>
                    <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {s.title[language]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div className="mb-4 grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-7 rounded-3xl border backdrop-blur shadow-sm p-4 border-neutral-200 bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/60">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                  <Filter className="h-4 w-4" />
                  {isRTL ? "تصفية" : "Filters"}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ChipBtn active={viewMode === "chart"} onClick={() => setViewMode("chart")}>
                    <Eye className="h-4 w-4" />
                    {isRTL ? "رسم" : "Chart"}
                  </ChipBtn>
                  <ChipBtn active={viewMode === "table"} onClick={() => setViewMode("table")}>
                    <Table2 className="h-4 w-4" />
                    {isRTL ? "جدول" : "Table"}
                  </ChipBtn>

                  <button
                    type="button"
                    onClick={copySummary}
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
                      "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                      "dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800/70",
                    )}>
                    <Copy className="h-4 w-4" />
                    {isRTL ? "نسخ" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Chart type */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <ChipBtn active={chartType === "pie"} onClick={() => setChartType("pie")}>
                  {isRTL ? "دائري" : "Pie"}
                </ChipBtn>
                <ChipBtn active={chartType === "line"} onClick={() => setChartType("line")}>
                  {isRTL ? "خطي" : "Line"}
                </ChipBtn>
                <ChipBtn active={chartType === "bar"} onClick={() => setChartType("bar")}>
                  {isRTL ? "أعمدة" : "Bar"}
                </ChipBtn>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isRTL ? "بحث..." : "Search..."}
                  className={clsx(
                    "rounded-2xl border px-3 py-2 text-sm outline-none transition",
                    "border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-neutral-950/10",
                    "dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:ring-neutral-200/10",
                  )}
                />

                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value as Range)}
                  className={clsx(
                    "rounded-2xl border px-3 py-2 text-sm outline-none transition",
                    "border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-neutral-950/10",
                    "dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:ring-neutral-200/10",
                  )}>
                  <option value="all">{isRTL ? "الكل" : "All"}</option>
                  <option value="top5">{isRTL ? "أفضل 5" : "Top 5"}</option>
                  <option value="top10">{isRTL ? "أفضل 10" : "Top 10"}</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className={clsx(
                    "rounded-2xl border px-3 py-2 text-sm outline-none transition",
                    "border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-neutral-950/10",
                    "dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:ring-neutral-200/10",
                  )}>
                  <option value="value_desc">{isRTL ? "قيمة: تنازلي" : "Value: desc"}</option>
                  <option value="value_asc">{isRTL ? "قيمة: تصاعدي" : "Value: asc"}</option>
                  <option value="label_asc">{isRTL ? "اسم: أ-ي" : "Label: A-Z"}</option>
                  <option value="label_desc">{isRTL ? "اسم: ي-أ" : "Label: Z-A"}</option>
                </select>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <ChipBtn active={showLegend} onClick={() => setShowLegend((v) => !v)}>
                  {showLegend ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {isRTL ? "الوسيلة" : "Legend"}
                </ChipBtn>

                <ChipBtn active={showGrid} onClick={() => setShowGrid((v) => !v)}>
                  {showGrid ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {isRTL ? "الشبكة" : "Grid"}
                </ChipBtn>

                <ChipBtn active={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  {showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {isRTL ? "القيم" : "Values"}
                </ChipBtn>

                {/* Kept as state & used for chart behavior; no extra imports */}
                <ChipBtn
                  active={normalization === "percent"}
                  onClick={() => setNormalization((v) => (v === "raw" ? "percent" : "raw"))}>
                  {isRTL ? "نِسَب" : "Percent"}
                </ChipBtn>

                <ChipBtn
                  active={minSlicePercent > 0}
                  onClick={() => setMinSlicePercent((v) => (v === 0 ? 4 : 0))}>
                  {isRTL ? "إخفاء الصغير" : "Hide tiny"}
                </ChipBtn>
              </div>
            </div>

            {/* Summary box */}
            <div className="lg:col-span-5 rounded-3xl border backdrop-blur shadow-sm p-4 border-neutral-200 bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/60">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                <Info className="h-4 w-4" />
                {isRTL ? "ملخص" : "Summary"}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatChip label={isRTL ? "عدد العناصر" : "Items"} value={`${chartStats.count}`} />

                <StatChip
                  label={isRTL ? "المجموع" : "Sum"}
                  value={
                    activeChart === "revenue"
                      ? `${chartStats.total.toFixed(3)} KD`
                      : `${Math.round(chartStats.total)} ${unit}`
                  }
                />

                <StatChip
                  label={isRTL ? "الأعلى" : "Max"}
                  value={
                    activeChart === "revenue"
                      ? money(chartStats.max)
                      : `${Math.round(chartStats.max)} ${unit}`
                  }
                />

                <StatChip
                  label={isRTL ? "المتوسط" : "Avg"}
                  value={
                    activeChart === "revenue"
                      ? money(chartStats.avg)
                      : `${Math.round(chartStats.avg)} ${unit}`
                  }
                />
              </div>

              <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                {normalization === "percent"
                  ? isRTL
                    ? "عرض القيم كنِسَب (مع إظهار القيمة الأصلية في التولتيب)."
                    : "Values are shown as percentages (raw value is kept in tooltip)."
                  : isRTL
                    ? "عرض القيم كأرقام فعلية."
                    : "Values are shown as raw numbers."}
              </div>
            </div>
          </div>

          {/* Chart / Table */}
          <Card className="w-full rounded-3xl overflow-hidden border border-neutral-200 bg-white/80 backdrop-blur shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-neutral-950 dark:text-neutral-50">
                {chartTitle}
              </CardTitle>
              <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
                {chartDesc}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2">
              {viewMode === "table" ? (
                <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                  <table className="min-w-full text-sm">
                    <thead className="text-left bg-neutral-50 dark:bg-neutral-900/50">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-200">
                          {isRTL ? "الاسم" : "Label"}
                        </th>
                        <th className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-200">
                          {isRTL ? "القيمة" : "Value"}
                        </th>
                        <th className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-200">
                          {isRTL ? "النسبة" : "Percent"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSortedData.map((d: any, idx: number) => {
                        const v = Number(d.value) || 0;
                        const pct = (v / totalSafe) * 100;
                        return (
                          <tr
                            key={`${d.label}_${idx}`}
                            className="border-t border-neutral-200 dark:border-neutral-800">
                            <td className="px-4 py-3 text-neutral-900 dark:text-neutral-100">
                              {String(d.label)}
                            </td>
                            <td className="px-4 py-3 text-neutral-900 dark:text-neutral-100">
                              {activeChart === "revenue" ? v.toFixed(3) : Math.round(v)}{" "}
                              {activeChart === "revenue" ? "KD" : unit}
                            </td>
                            <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                              {pct.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}

                      {!filteredSortedData.length ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                            {isRTL ? "لا توجد بيانات" : "No data"}
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-[360px] sm:h-[420px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "pie" ? (
                      <PieChart>
                        <Tooltip formatter={formatTooltip as any} />
                        {showLegend ? <Legend /> : null}

                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius="78%"
                          innerRadius="52%"
                          paddingAngle={2}
                          labelLine={false}
                          label={showLabels ? renderPieLabel : false}>
                          {chartData.map((_: any, idx: number) => (
                            <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                          ))}
                        </Pie>

                        {/* Center label */}
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                          <tspan
                            className="fill-neutral-900 dark:fill-neutral-50"
                            fontSize="14"
                            fontWeight="700">
                            {legendLabel}
                          </tspan>
                          <tspan
                            x="50%"
                            dy="18"
                            className="fill-neutral-500 dark:fill-neutral-400"
                            fontSize="12">
                            {activeChart === "revenue"
                              ? `${chartStats.total.toFixed(3)} KD`
                              : `${Math.round(chartStats.total)} ${unit}`}
                          </tspan>
                        </text>
                      </PieChart>
                    ) : chartType === "line" ? (
                      <LineChart
                        data={chartData}
                        margin={{ top: 18, right: 18, left: 10, bottom: 8 }}>
                        {showGrid ? <CartesianGrid vertical={false} strokeDasharray="3 3" /> : null}
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) =>
                            String(v)?.length > 14 ? String(v).slice(0, 14) + "…" : v
                          }
                        />
                        <YAxis tickLine={false} axisLine={false} width={44} />
                        <Tooltip formatter={formatTooltip as any} />
                        {showLegend ? <Legend formatter={() => legendLabel} /> : null}

                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#0a0a0a"
                          strokeWidth={3}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    ) : (
                      <BarChart
                        data={chartData}
                        margin={{ top: 18, right: 18, left: 10, bottom: 8 }}>
                        {showGrid ? <CartesianGrid vertical={false} strokeDasharray="3 3" /> : null}
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) =>
                            String(v)?.length > 14 ? String(v).slice(0, 14) + "…" : v
                          }
                        />
                        <YAxis tickLine={false} axisLine={false} width={44} />
                        <Tooltip formatter={formatTooltip as any} />
                        {showLegend ? <Legend formatter={() => legendLabel} /> : null}

                        <Bar dataKey="value" fill="#0a0a0a" radius={10}>
                          {showLabels ? (
                            <LabelList
                              dataKey="value"
                              position="top"
                              formatter={(v: any) => formatValue(v)}
                            />
                          ) : null}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 flex flex-wrap items-center gap-2">
            <Info className="h-4 w-4" />
            {isRTL
              ? "ميزات إضافية: جدول، نسخ الملخص، تغيير النِسَب، إخفاء نسب صغيرة في الدائري."
              : "Extra features: table view, copy summary, percent mode, hide tiny pie % labels."}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SummaryCharts;
