import { useMemo, useState } from "react";
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
  CartesianGrid,
  LabelList,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, Wallet, BarChart3 } from "lucide-react";
import clsx from "clsx";

const SummaryBarChart = () => {
  const { data: usersData, isLoading: loadingUsers } = useGetGovernorateQuery<any>(undefined);
  const { data: orderStats, isLoading: loadingOrders } = useGetOrderStatsQuery<any>(undefined);
  const { data: revenuStats, isLoading: loadingRevenue } = useGetRevenuStatsQuery<any>(undefined);

  const language = useSelector((state: any) => state.language.lang);
  const isRTL = language === "ar";

  const [activeChart, setActiveChart] = useState<"users" | "orders" | "revenue">("users");

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

  const chartData =
    activeChart === "users"
      ? usersChartData
      : activeChart === "orders"
        ? ordersChartData
        : revenueChartData;

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

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div className={clsx(" w-full max-w-4xl px-4 py-6 mt-[70px]", isRTL ? "rtl" : "ltr")}>
          {/* Header */}
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
                {isRTL ? "لوحة الإحصائيات" : "Summary Dashboard"}
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                {isRTL
                  ? "نظرة عامة سريعة على المستخدمين والطلبات والإيرادات."
                  : "Quick view of users, orders and revenue."}
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-500">
              <BarChart3 className="h-4 w-4" />
              {isRTL ? "محدث تلقائياً" : "Auto-updated"}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {summaryStats.map((s) => {
              const Icon = s.icon;
              return (
                <Card
                  key={s.key}
                  className="rounded-3xl border-neutral-200 bg-white/80 backdrop-blur shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50">
                        <Icon className="h-5 w-5 text-neutral-900" />
                      </div>
                      <span className="text-xs font-semibold text-neutral-500">
                        {isRTL ? "إجمالي" : "TOTAL"}
                      </span>
                    </div>

                    <CardTitle className="mt-3 text-2xl sm:text-3xl">{s.value}</CardTitle>
                    <CardDescription className="text-sm" dir={isRTL ? "rtl" : "ltr"}>
                      {s.title[language as "en" | "ar"]}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {/* Tabs (modern pills) */}
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              { key: "users", label: isRTL ? "المستخدمون" : "Users" },
              { key: "orders", label: isRTL ? "الطلبات" : "Orders" },
              { key: "revenue", label: isRTL ? "الإيرادات" : "Revenue" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveChart(t.key as any)}
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

          {/* Chart */}
          <Card className="w-full rounded-3xl border-neutral-200 bg-white/80 backdrop-blur shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{chartTitle}</CardTitle>
              <CardDescription className="text-sm">{chartDesc}</CardDescription>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 18, right: 18, left: 10, bottom: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => (v?.length > 12 ? v.slice(0, 12) + "…" : v)}
                    />
                    <Tooltip
                      formatter={(value: any) =>
                        `${activeChart === "revenue" ? Number(value).toFixed(3) : value} ${unit}`
                      }
                    />
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
                    <Bar dataKey="value" fill="#0a0a0a" radius={10}>
                      <LabelList
                        dataKey="value"
                        position="top"
                        formatter={(v: any) =>
                          activeChart === "revenue" ? `${Number(v).toFixed(3)} KD` : v
                        }
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* tiny helper */}
              <p className="mt-3 text-xs text-neutral-500">
                {isRTL
                  ? "اضغط على الأزرار بالأعلى لتبديل الرسم."
                  : "Use the tabs above to switch charts."}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default SummaryBarChart;
