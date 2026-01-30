import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { useSelector } from "react-redux";
import Layout from "../../Layout";
import Loader from "../../components/Loader";
import { useGetGovernorateQuery } from "@/redux/queries/userApi";
import { useGetOrderStatsQuery, useGetRevenuStatsQuery } from "../../redux/queries/orderApi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  ShoppingBag,
  Wallet,
  BarChart3,
  RefreshCcw,
  Download,
  Eye,
  EyeOff,
  Filter,
  Maximize2,
  Minimize2,
  Info,
} from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

type RootState = {
  language: { lang: "en" | "ar" };
};

type ActiveChart = "users" | "orders" | "revenue";
type SortBy = "value_desc" | "value_asc" | "label_asc" | "label_desc";
type Range = "all" | "top5" | "top10";

const SummaryBarChart = (): JSX.Element => {
  const { data: usersData, isLoading: loadingUsers } = useGetGovernorateQuery<any>(undefined);
  const { data: orderStats, isLoading: loadingOrders } = useGetOrderStatsQuery<any>(undefined);
  const { data: revenuStats, isLoading: loadingRevenue } = useGetRevenuStatsQuery<any>(undefined);

  const language = useSelector((state: RootState) => state.language.lang);
  const isRTL = language === "ar";

  const [activeChart, setActiveChart] = useState<ActiveChart>("users");

  // NEW: UX controls
  const [range, setRange] = useState<Range>("all"); // top N / all
  const [sortBy, setSortBy] = useState<SortBy>("value_desc");
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [compact, setCompact] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);

  // NEW: search/filter labels
  const [search, setSearch] = useState<string>("");

  // NEW: manual refresh indicator + last updated stamp
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const firstLoadRef = useRef(true);

  useEffect(() => {
    const isLoading = loadingUsers || loadingOrders || loadingRevenue;
    if (!isLoading) {
      setLastUpdatedAt(new Date());
      if (firstLoadRef.current) firstLoadRef.current = false;
    }
  }, [loadingUsers, loadingOrders, loadingRevenue]);

  const arabicOnly = useMemo(() => {
    return usersData?.governorates?.map((item: any) => {
      const match = item.governorate.match(/[\u0600-\u06FF].*/);
      return { ...item, governorate: match ? match[0].trim() : item.governorate };
    });
  }, [usersData]);

  const summaryStats = useMemo(
    () => [
      {
        key: "users",
        icon: Users,
        title: { en: "Total Users", ar: "المستخدمين" },
        value: usersData?.totalUsers ?? 0,
        hint: { en: "Registered users", ar: "إجمالي المستخدمين" },
      },
      {
        key: "orders",
        icon: ShoppingBag,
        title: { en: "Total Orders", ar: "الطلبات" },
        value: orderStats?.total ?? 0,
        hint: { en: "All order records", ar: "إجمالي الطلبات" },
      },
      {
        key: "revenue",
        icon: Wallet,
        title: { en: "Total Revenue", ar: "الإيرادات" },
        value: `${(revenuStats?.totalRevenue ?? 0).toFixed(3)} KD`,
        hint: { en: "Sum of paid totals", ar: "مجموع الإيرادات" },
      },
    ],
    [usersData, orderStats, revenuStats],
  );

  const usersChartData = useMemo(
    () =>
      arabicOnly?.map((gov: any) => ({
        label: gov.governorate || "",
        value: gov.count || 0,
      })) || [],
    [arabicOnly],
  );

  const ordersChartData = useMemo(() => {
    if (!orderStats) return [];
    return [
      { label: isRTL ? "تم التوصيل" : "Delivered", value: orderStats.delivered },
      { label: isRTL ? "ملغي" : "Canceled", value: orderStats.canceled },
      { label: isRTL ? "قيد التنفيذ" : "Processing", value: orderStats.processing },
    ];
  }, [orderStats, isRTL]);

  const revenueChartData = useMemo(
    () =>
      revenuStats?.monthly?.map((item: any) => ({
        label: new Date(2025, item._id - 1).toLocaleString(isRTL ? "ar" : "en", { month: "short" }),
        value: item.totalRevenue,
      })) || [],
    [revenuStats, isRTL],
  );

  const rawChartData =
    activeChart === "users"
      ? usersChartData
      : activeChart === "orders"
        ? ordersChartData
        : revenueChartData;

  // NEW: derived stats for current chart (min/max/avg)
  const chartStats = useMemo(() => {
    const values = rawChartData.map((d: any) => Number(d.value) || 0);
    const total = values.reduce((a: any, b: any) => a + b, 0);
    const max = values.length ? Math.max(...values) : 0;
    const min = values.length ? Math.min(...values) : 0;
    const avg = values.length ? total / values.length : 0;
    return { total, max, min, avg, count: values.length };
  }, [rawChartData]);

  // NEW: apply search filter + sort + topN
  const chartData = useMemo(() => {
    let next = [...rawChartData];

    if (search.trim()) {
      const q = search.toLowerCase();
      next = next.filter((d) =>
        String(d.label || "")
          .toLowerCase()
          .includes(q),
      );
    }

    switch (sortBy) {
      case "value_asc":
        next.sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
        break;
      case "value_desc":
        next.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
        break;
      case "label_asc":
        next.sort((a, b) => String(a.label).localeCompare(String(b.label)));
        break;
      case "label_desc":
        next.sort((a, b) => String(b.label).localeCompare(String(a.label)));
        break;
    }

    if (range === "top5") next = next.slice(0, 5);
    if (range === "top10") next = next.slice(0, 10);

    return next;
  }, [rawChartData, search, sortBy, range]);

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

  const isLoading = loadingUsers || loadingOrders || loadingRevenue;

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

  // NEW: CSV export
  const exportCSV = () => {
    const header = ["label", "value"];
    const rows = chartData.map((d: any) => [
      `"${String(d.label ?? "").replaceAll('"', '""')}"`,
      `${d.value ?? 0}`,
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeChart}-chart.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTooltip = (value: any) => {
    if (activeChart === "revenue") return `${Number(value).toFixed(3)} ${unit}`;
    return `${value} ${unit}`;
  };

  const formatLabel = (v: any) => {
    if (activeChart === "revenue") return `${Number(v).toFixed(3)}`;
    return v;
  };

  const TopBadge = ({ label, value }: { label: string; value: number }) => (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-neutral-950">{value}</div>
    </div>
  );

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div
          className={clsx(
            "w-full px-4 py-6 mt-[70px]",
            fullscreen ? "max-w-none" : "max-w-6xl",
            isRTL ? "rtl" : "ltr",
          )}>
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
                {isRTL ? "لوحة الإحصائيات" : "Summary Dashboard"}
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                {isRTL
                  ? "نظرة عامة سريعة مع أدوات تصفية وتصدير."
                  : "Quick overview with filtering and export tools."}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <BarChart3 className="h-4 w-4" />
              <span>
                {isRTL ? "آخر تحديث:" : "Last update:"}{" "}
                {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString(isRTL ? "ar" : "en") : "—"}
              </span>
            </div>
          </div>

          {/* Summary Cards */}
          <div
            className={clsx(
              "grid gap-3 mb-6",
              compact ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-3",
            )}>
            {summaryStats.map((s) => {
              const Icon = s.icon;
              const isActive = activeChart === (s.key as ActiveChart);
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActiveChart(s.key as ActiveChart)}
                  className={clsx(
                    "text-left",
                    "rounded-3xl border bg-white/80 backdrop-blur shadow-sm transition",
                    isActive
                      ? "border-neutral-950 ring-2 ring-neutral-950/10"
                      : "border-neutral-200 hover:bg-white",
                  )}>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50">
                        <Icon className="h-5 w-5 text-neutral-900" />
                      </div>
                      <span className="text-xs font-semibold text-neutral-500">
                        {isRTL ? "إجمالي" : "TOTAL"}
                      </span>
                    </div>

                    <div className="mt-3 text-2xl sm:text-3xl font-semibold text-neutral-950">
                      {s.value}
                    </div>
                    <div className="mt-1 text-sm text-neutral-600" dir={isRTL ? "rtl" : "ltr"}>
                      {s.title[language as "en" | "ar"]}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {s.hint[language as "en" | "ar"]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tabs + Controls */}
          <div className="mb-4 flex flex-col gap-3">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: "users", label: isRTL ? "المستخدمون" : "Users" },
                { key: "orders", label: isRTL ? "الطلبات" : "Orders" },
                { key: "revenue", label: isRTL ? "الإيرادات" : "Revenue" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveChart(t.key as ActiveChart)}
                  className={clsx(
                    "rounded-full px-4 py-2 text-sm font-semibold transition",
                    activeChart === t.key
                      ? "bg-neutral-950 text-white shadow-[0_10px_25px_rgba(0,0,0,0.18)]"
                      : "bg-white/80 backdrop-blur border border-neutral-200 text-neutral-900 hover:bg-white",
                  )}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Controls row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-5 rounded-3xl border border-neutral-200 bg-white/80 backdrop-blur shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-neutral-900">
                  <Filter className="h-4 w-4" />
                  {isRTL ? "تصفية" : "Filter"}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={isRTL ? "بحث..." : "Search..."}
                    className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10"
                  />

                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value as Range)}
                    className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10">
                    <option value="all">{isRTL ? "الكل" : "All"}</option>
                    <option value="top5">{isRTL ? "أفضل 5" : "Top 5"}</option>
                    <option value="top10">{isRTL ? "أفضل 10" : "Top 10"}</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10">
                    <option value="value_desc">{isRTL ? "قيمة: تنازلي" : "Value: desc"}</option>
                    <option value="value_asc">{isRTL ? "قيمة: تصاعدي" : "Value: asc"}</option>
                    <option value="label_asc">{isRTL ? "اسم: أ-ي" : "Label: A-Z"}</option>
                    <option value="label_desc">{isRTL ? "اسم: ي-أ" : "Label: Z-A"}</option>
                  </select>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLabels((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-50 transition">
                    {showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {isRTL ? "القيم" : "Values"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLegend((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-50 transition">
                    {showLegend ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {isRTL ? "الوسيلة" : "Legend"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowGrid((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-50 transition">
                    {showGrid ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {isRTL ? "الشبكة" : "Grid"}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 rounded-3xl border border-neutral-200 bg-white/80 backdrop-blur shadow-sm p-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                    <Info className="h-4 w-4" />
                    {isRTL ? "ملخص الرسم" : "Chart summary"}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={exportCSV}
                      className="rounded-2xl"
                      type="button">
                      <Download className="h-4 w-4 mr-2" />
                      {isRTL ? "CSV" : "CSV"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setCompact((v) => !v)}
                      className="rounded-2xl"
                      type="button">
                      {compact ? (
                        <>
                          <Minimize2 className="h-4 w-4 mr-2" />
                          {isRTL ? "عادي" : "Normal"}
                        </>
                      ) : (
                        <>
                          <Maximize2 className="h-4 w-4 mr-2" />
                          {isRTL ? "مضغوط" : "Compact"}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setFullscreen((v) => !v)}
                      className="rounded-2xl"
                      type="button">
                      {fullscreen ? (
                        <>
                          <Minimize2 className="h-4 w-4 mr-2" />
                          {isRTL ? "إنهاء" : "Exit"}
                        </>
                      ) : (
                        <>
                          <Maximize2 className="h-4 w-4 mr-2" />
                          {isRTL ? "شاشة كاملة" : "Fullscreen"}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="rounded-2xl"
                      type="button">
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      {isRTL ? "تحديث" : "Refresh"}
                    </Button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <TopBadge label={isRTL ? "عدد العناصر" : "Items"} value={chartStats.count} />
                  <TopBadge
                    label={isRTL ? "أعلى قيمة" : "Max"}
                    value={
                      activeChart === "revenue" ? Number(chartStats.max.toFixed(3)) : chartStats.max
                    }
                  />
                  <TopBadge
                    label={isRTL ? "متوسط" : "Avg"}
                    value={
                      activeChart === "revenue"
                        ? Number(chartStats.avg.toFixed(3))
                        : Math.round(chartStats.avg)
                    }
                  />
                  <TopBadge
                    label={isRTL ? "المجموع" : "Sum"}
                    value={
                      activeChart === "revenue"
                        ? Number(chartStats.total.toFixed(3))
                        : Math.round(chartStats.total)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <Card className="w-full rounded-3xl border-neutral-200 bg-white/80 backdrop-blur shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{chartTitle}</CardTitle>
              <CardDescription className="text-sm">{chartDesc}</CardDescription>
            </CardHeader>

            <CardContent className="pt-2">
              <div className={clsx(compact ? "h-[320px]" : "h-[420px]")}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 18, right: 18, left: 10, bottom: 8 }}>
                    {showGrid ? <CartesianGrid vertical={false} strokeDasharray="3 3" /> : null}
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) =>
                        String(v)?.length > 14 ? String(v).slice(0, 14) + "…" : v
                      }
                    />
                    <YAxis tickLine={false} axisLine={false} width={40} />
                    <Tooltip formatter={(value: any) => formatTooltip(value)} />
                    {showLegend ? (
                      <Legend
                        formatter={() =>
                          isRTL
                            ? activeChart === "users"
                              ? "المستخدمون"
                              : activeChart === "orders"
                                ? "الطلبات"
                                : "الإيرادات"
                            : activeChart === "users"
                              ? "Users"
                              : activeChart === "orders"
                                ? "Orders"
                                : "Revenue"
                        }
                      />
                    ) : null}

                    <Bar dataKey="value" fill="#0a0a0a" radius={10}>
                      {showLabels ? (
                        <LabelList
                          dataKey="value"
                          position="top"
                          formatter={(v: any) => formatLabel(v)}
                        />
                      ) : null}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="mt-3 text-xs text-neutral-500">
                {isRTL
                  ? "يمكنك البحث، الترتيب، وتصدير البيانات إلى CSV."
                  : "Search, sort, and export the chart data to CSV."}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default SummaryBarChart;
