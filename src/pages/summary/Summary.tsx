import { useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../../Layout";
import { useGetGovernorateQuery } from "@/redux/queries/userApi";
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
import Loader from "../../components/Loader";
import { useGetOrderStatsQuery, useGetRevenuStatsQuery } from "../../redux/queries/orderApi";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const SummaryBarChart = () => {
  const { data: usersData, isLoading: loadingUsers } = useGetGovernorateQuery<any>(undefined);
  const { data: orderStats, isLoading: loadingOrders } = useGetOrderStatsQuery<any>(undefined);
  const { data: revenuStats, isLoading: loadingRevenue } = useGetRevenuStatsQuery<any>(undefined);

  const arabicOnly = usersData?.governorates?.map((item: any) => {
    const match = item.governorate.match(/[\u0600-\u06FF].*/);
    return { ...item, governorate: match ? match[0].trim() : item.governorate };
  });

  const summaryStats = [
    { title: { en: "Total Users", ar: "المستخدمين" }, value: usersData?.totalUsers },
    { title: { en: "Total Orders", ar: "الطلبات" }, value: orderStats?.total },
    {
      title: { en: "Total Revenue", ar: "الإيرادات" },
      value: `${revenuStats?.totalRevenue?.toFixed(3)} KD`,
    },
  ];
  const language = useSelector((state: any) => state.language.lang);
  const [activeChart, setActiveChart] = useState<"users" | "orders" | "revenue">("users");

  // Users chart data
  const usersChartData = arabicOnly?.map((gov: any) => ({
    month: gov.governorate || "",
    value: gov.count || 0,
  }));

  // Orders chart data
  const ordersChartData = orderStats
    ? [
        { month: language === "ar" ? "تم التوصيل" : "Delivered", value: orderStats.delivered },
        { month: language === "ar" ? "ملغي" : "Canceled", value: orderStats.canceled },
        { month: language === "ar" ? "قيد التنفيذ" : "Processing", value: orderStats.processing },
      ]
    : [];

  // Revenue chart data from API
  const revenueChartData = revenuStats?.monthly?.map((item: any) => ({
    month: new Date(2025, item._id - 1).toLocaleString(language === "ar" ? "ar" : "en", {
      month: "short",
    }),
    value: item.totalRevenue,
  }));

  // Select chart data based on active tab
  const chartData =
    activeChart === "users"
      ? usersChartData
      : activeChart === "orders"
      ? ordersChartData
      : revenueChartData;

  const chartTitle =
    activeChart === "users"
      ? language === "ar"
        ? "توزيع المستخدمين حسب المحافظة"
        : "User Distribution by Governorate"
      : activeChart === "orders"
      ? language === "ar"
        ? "توزيع الطلبات حسب الحالة"
        : "Orders Distribution by Status"
      : language === "ar"
      ? "الإيرادات الشهرية"
      : "Monthly Revenue";

  const chartDesc =
    activeChart === "users"
      ? language === "ar"
        ? "المستخدمون الحاليون لكل محافظة"
        : "Current Users per Governorate"
      : activeChart === "orders"
      ? language === "ar"
        ? "عدد الطلبات حسب الحالة"
        : "Orders by Status"
      : language === "ar"
      ? "الإيرادات لكل شهر"
      : "Revenue per Month";

  const isLoading = loadingUsers || loadingOrders || loadingRevenue;

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div
          className={`px-4 flex flex-col lg:w-4xl w-full min-h-screen lg:min-h-auto py-3 mt-[70px] ${
            language === "ar" ? "rtl" : "ltr"
          }`}>
          {/* Summary Cards */}
          <div className="flex lg:flex-row items-center sm:gap-3 mb-5">
            {summaryStats.map((stat: any, idx) => (
              <Card key={idx} className="flex-1 text-center">
                <CardHeader>
                  <CardTitle className="sm:text-xl">{stat.value}</CardTitle>
                  <CardDescription className="truncate" dir="rtl">
                    {stat.title[language]}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Chart Navigation */}
          <div className="flex gap-2 mb-5">
            <button
              className={`px-4 py-2 rounded-full transition ${
                activeChart === "users"
                  ? "bg-blue-500 text-white drop-shadow-[0_4px_6px_rgba(59,130,246,0.5)]"
                  : "bg-gray-200 drop-shadow-[0_4px_6px_rgba(229,231,235,0.6)]"
              }`}
              onClick={() => setActiveChart("users")}>
              {language === "ar" ? "المستخدمون" : "Users"}
            </button>

            <button
              className={`px-4 py-2 rounded-full transition ${
                activeChart === "orders"
                  ? "bg-blue-500 text-white drop-shadow-[0_4px_6px_rgba(59,130,246,0.5)]"
                  : "bg-gray-200 drop-shadow-[0_4px_6px_rgba(229,231,235,0.6)]"
              }`}
              onClick={() => setActiveChart("orders")}>
              {language === "ar" ? "الطلبات" : "Orders"}
            </button>

            <button
              className={`px-4 py-2 rounded-full transition ${
                activeChart === "revenue"
                  ? "bg-blue-500 text-white drop-shadow-[0_4px_6px_rgba(59,130,246,0.5)]"
                  : "bg-gray-200 drop-shadow-[0_4px_6px_rgba(229,231,235,0.6)]"
              }`}
              onClick={() => setActiveChart("revenue")}>
              {language === "ar" ? "الإيرادات" : "Revenue"}
            </button>
          </div>

          {/* Bar Chart */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{chartTitle}</CardTitle>
              <CardDescription>{chartDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      value ? (value.length > 12 ? value.slice(0, 20) + "…" : value) : ""
                    }
                  />
                  <Tooltip
                    formatter={(value) =>
                      language === "ar"
                        ? `${activeChart === "revenue" ? (value as number).toFixed(3) : value} ${
                            activeChart === "users"
                              ? "مستخدم"
                              : activeChart === "orders"
                              ? "طلب"
                              : "KD"
                          }`
                        : `${activeChart === "revenue" ? (value as number).toFixed(3) : value} ${
                            activeChart === "users"
                              ? "users"
                              : activeChart === "orders"
                              ? "orders"
                              : "KD"
                          }`
                    }
                  />

                  <Legend
                    formatter={() =>
                      language === "ar"
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
                  <Bar dataKey="value" fill={COLORS[0]} radius={8}>
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(value: any) =>
                        activeChart === "revenue" ? `${value.toFixed(3)} KD` : value
                      }
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default SummaryBarChart;
