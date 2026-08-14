import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { useSelector } from "react-redux";
import Layout from "../../Layout";
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
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  Check,
} from "lucide-react";
import clsx from "clsx";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { PageSkeleton } from "@/components/Skeleton";

type RootState = {
  language: { lang: "en" | "ar" };
  theme: { theme: "light" | "dark" };
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
  const [copied, setCopied] = useState(false);
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

  // One hue per metric, reused by the cards, the chart and the table bars so
  // the colour always means the same thing.
  const METRIC_ACCENT: Record<ActiveChart, string> = {
    users: "var(--viz-1)",
    orders: "var(--viz-2)",
    revenue: "var(--viz-3)",
  };

  const accent = METRIC_ACCENT[activeChart];

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

  // Categorical palette — distinct hues so adjacent slices never blur together.
  // These go straight into SVG fill/stroke attributes, where `var()` resolves
  // at paint time, so the palette follows the theme with no JS involved.
  // (Reading the tokens with getComputedStyle would be a frame stale: the
  // `.dark` class is toggled by a parent effect that runs after this render.)
  const PIE_COLORS = [
    "var(--viz-1)",
    "var(--viz-2)",
    "var(--viz-3)",
    "var(--viz-4)",
    "var(--viz-5)",
    "var(--viz-6)",
    "var(--viz-7)",
    "var(--viz-8)",
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

  const StatChip = ({ label, value, tone }: { label: string; value: string; tone: string }) => (
    <div
      className="relative overflow-hidden rounded-xl border p-3 ps-4"
      style={{
        borderColor: `color-mix(in srgb, ${tone} 24%, var(--border))`,
        backgroundColor: `color-mix(in srgb, ${tone} 7%, var(--surface-muted))`,
      }}>
      <span
        aria-hidden
        className="absolute inset-y-0 start-0 w-1"
        style={{ backgroundColor: tone }}
      />
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-base font-extrabold">{value}</div>
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
      aria-pressed={active}
      className={clsx("ws-chip", active && "ws-chip-active")}>
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
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // silent (some browsers block)
    }
  };

  // Bars and lines take the hue of the metric being shown.
  const barFill = accent;

  return (
    <Layout>
      {isLoading ? (
        <PageSkeleton />
      ) : (
        <div className="animate-fade-up">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                {isRTL ? "لوحة الإحصائيات" : "Summary Dashboard"}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <Info className="size-3.5" />
                {isRTL ? "آخر تحديث:" : "Last update:"}{" "}
                {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString(isRTL ? "ar" : "en") : "—"}
              </p>
            </div>

            <div className="no-print flex flex-wrap items-center gap-2">
              <button type="button" onClick={refreshNow} className="ws-chip h-10 px-3.5">
                <RefreshCw className="size-4" />
                {isRTL ? "تحديث" : "Refresh"}
              </button>

              <button type="button" onClick={() => window.print()} className="ws-chip h-10 px-3.5">
                <Printer className="size-4" />
                {isRTL ? "طباعة" : "Print"}
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {summaryStats.map((s) => (
              <StatCard
                key={s.key}
                label={s.title[language]}
                value={s.value}
                icon={s.icon}
                hint={isRTL ? "إجمالي" : "TOTAL"}
                accent={METRIC_ACCENT[s.key as ActiveChart]}
                active={activeChart === (s.key as ActiveChart)}
                onClick={() => setActiveChart(s.key as ActiveChart)}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="ws-card p-4 xl:col-span-7">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Filter className="size-4" style={{ color: "var(--viz-5)" }} />
                  {isRTL ? "تصفية" : "Filters"}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ChipBtn active={viewMode === "chart"} onClick={() => setViewMode("chart")}>
                    <Eye className="size-3.5" />
                    {isRTL ? "رسم" : "Chart"}
                  </ChipBtn>
                  <ChipBtn active={viewMode === "table"} onClick={() => setViewMode("table")}>
                    <Table2 className="size-3.5" />
                    {isRTL ? "جدول" : "Table"}
                  </ChipBtn>

                  <button type="button" onClick={copySummary} className="ws-chip">
                    {copied ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    {copied ? (isRTL ? "تم النسخ" : "Copied") : isRTL ? "نسخ" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Chart type */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <ChipBtn active={chartType === "pie"} onClick={() => setChartType("pie")}>
                  <PieIcon className="size-3.5" />
                  {isRTL ? "دائري" : "Pie"}
                </ChipBtn>
                <ChipBtn active={chartType === "line"} onClick={() => setChartType("line")}>
                  <LineIcon className="size-3.5" />
                  {isRTL ? "خطي" : "Line"}
                </ChipBtn>
                <ChipBtn active={chartType === "bar"} onClick={() => setChartType("bar")}>
                  <BarChart3 className="size-3.5" />
                  {isRTL ? "أعمدة" : "Bar"}
                </ChipBtn>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isRTL ? "بحث..." : "Search..."}
                  className="ws-input"
                />

                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value as Range)}
                  className="ws-select">
                  <option value="all">{isRTL ? "الكل" : "All"}</option>
                  <option value="top5">{isRTL ? "أفضل 5" : "Top 5"}</option>
                  <option value="top10">{isRTL ? "أفضل 10" : "Top 10"}</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="ws-select">
                  <option value="value_desc">{isRTL ? "قيمة: تنازلي" : "Value: desc"}</option>
                  <option value="value_asc">{isRTL ? "قيمة: تصاعدي" : "Value: asc"}</option>
                  <option value="label_asc">{isRTL ? "اسم: أ-ي" : "Label: A-Z"}</option>
                  <option value="label_desc">{isRTL ? "اسم: ي-أ" : "Label: Z-A"}</option>
                </select>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <ChipBtn active={showLegend} onClick={() => setShowLegend((v) => !v)}>
                  {showLegend ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  {isRTL ? "الوسيلة" : "Legend"}
                </ChipBtn>

                <ChipBtn active={showGrid} onClick={() => setShowGrid((v) => !v)}>
                  {showGrid ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  {isRTL ? "الشبكة" : "Grid"}
                </ChipBtn>

                <ChipBtn active={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  {showLabels ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  {isRTL ? "القيم" : "Values"}
                </ChipBtn>

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
            <div className="ws-card p-4 xl:col-span-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Info className="size-4" style={{ color: accent }} />
                {isRTL ? "ملخص" : "Summary"}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatChip
                  label={isRTL ? "عدد العناصر" : "Items"}
                  value={`${chartStats.count}`}
                  tone="var(--viz-5)"
                />

                <StatChip
                  label={isRTL ? "المجموع" : "Sum"}
                  value={
                    activeChart === "revenue"
                      ? `${chartStats.total.toFixed(3)} KD`
                      : `${Math.round(chartStats.total)} ${unit}`
                  }
                  tone={accent}
                />

                <StatChip
                  label={isRTL ? "الأعلى" : "Max"}
                  value={
                    activeChart === "revenue"
                      ? money(chartStats.max)
                      : `${Math.round(chartStats.max)} ${unit}`
                  }
                  tone="var(--viz-6)"
                />

                <StatChip
                  label={isRTL ? "المتوسط" : "Avg"}
                  value={
                    activeChart === "revenue"
                      ? money(chartStats.avg)
                      : `${Math.round(chartStats.avg)} ${unit}`
                  }
                  tone="var(--viz-8)"
                />
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
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
          <div className="ws-card overflow-hidden">
            {/* Colour rule ties the panel to the metric selected above. */}
            <span aria-hidden className="block h-1 w-full" style={{ backgroundColor: accent }} />

            <div
              className="border-b border-border p-5"
              style={{ backgroundColor: `color-mix(in srgb, ${accent} 5%, var(--card))` }}>
              <h2 className="text-base font-extrabold sm:text-lg">{chartTitle}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{chartDesc}</p>
            </div>

            <div className="p-4 sm:p-5">
              {!filteredSortedData.length ? (
                <EmptyState
                  title={isRTL ? "لا توجد بيانات" : "No data"}
                  description={
                    isRTL ? "غيّر الفلاتر أو البحث." : "Change the filters or search term."
                  }
                  icon={BarChart3}
                />
              ) : viewMode === "table" ? (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="ws-table">
                    <thead>
                      <tr>
                        <th>{isRTL ? "الاسم" : "Label"}</th>
                        <th>{isRTL ? "القيمة" : "Value"}</th>
                        <th className="text-end">{isRTL ? "النسبة" : "Percent"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSortedData.map((d: any, idx: number) => {
                        const v = Number(d.value) || 0;
                        const pct = (v / totalSafe) * 100;
                        return (
                          <tr key={`${d.label}_${idx}`}>
                            <td className="font-bold">
                              <span className="flex items-center gap-2">
                                <span
                                  aria-hidden
                                  className="size-2.5 shrink-0 rounded-full"
                                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                                />
                                {String(d.label)}
                              </span>
                            </td>
                            <td>
                              {activeChart === "revenue" ? v.toFixed(3) : Math.round(v)}{" "}
                              <span className="text-muted-foreground">
                                {activeChart === "revenue" ? "KD" : unit}
                              </span>
                            </td>
                            <td className="text-end">
                              <div className="flex items-center justify-end gap-2">
                                <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:block">
                                  <div
                                    className="h-full rounded-full transition-[width] duration-300"
                                    style={{
                                      width: `${Math.min(pct, 100)}%`,
                                      // Row colour matches its slice in the pie.
                                      backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                                    }}
                                  />
                                </div>
                                <span className="font-bold">{pct.toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-[340px] sm:h-[420px]">
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
                            <Cell
                              key={`cell-${idx}`}
                              fill={PIE_COLORS[idx % PIE_COLORS.length]}
                              stroke="var(--card)"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>

                        {/* Center label */}
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                          <tspan fill="var(--foreground)" fontSize="14" fontWeight="800">
                            {legendLabel}
                          </tspan>
                          <tspan x="50%" dy="18" fill="var(--muted-foreground)" fontSize="12">
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
                          reversed={isRTL}
                          tickFormatter={(v) =>
                            String(v)?.length > 14 ? String(v).slice(0, 14) + "…" : v
                          }
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          width={44}
                          orientation={isRTL ? "right" : "left"}
                        />
                        <Tooltip formatter={formatTooltip as any} />
                        {showLegend ? <Legend formatter={() => legendLabel} /> : null}

                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={barFill}
                          strokeWidth={3}
                          dot={{ r: 3, strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
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
                          reversed={isRTL}
                          tickFormatter={(v) =>
                            String(v)?.length > 14 ? String(v).slice(0, 14) + "…" : v
                          }
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          width={44}
                          orientation={isRTL ? "right" : "left"}
                        />
                        <Tooltip
                          formatter={formatTooltip as any}
                          cursor={{ fill: "var(--muted)" }}
                        />
                        {showLegend ? <Legend formatter={() => legendLabel} /> : null}

                        <Bar dataKey="value" fill={barFill} radius={[10, 10, 4, 4]}>
                          {/* Per-bar colour so a bar, its pie slice and its
                              table row all share one hue. */}
                          {chartData.map((_: any, idx: number) => (
                            <Cell key={`bar-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                          ))}

                          {showLabels ? (
                            <LabelList
                              dataKey="value"
                              position="top"
                              className="fill-muted-foreground"
                              formatter={(v: any) => formatValue(v)}
                            />
                          ) : null}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Info className="size-3.5" />
            {isRTL
              ? "ميزات إضافية: جدول، نسخ الملخص، تغيير النِسَب، إخفاء نسب صغيرة في الدائري."
              : "Extra features: table view, copy summary, percent mode, hide tiny pie % labels."}
          </p>
        </div>
      )}
    </Layout>
  );
};

export default SummaryCharts;
