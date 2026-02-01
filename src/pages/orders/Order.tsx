import Layout from "../../Layout";
import { useNavigate } from "react-router-dom";
import { useState, type ChangeEvent } from "react";
import Badge from "../../components/Badge";
import { useGetOrdersQuery } from "../../redux/queries/orderApi";
import { Layers, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Loader from "../../components/Loader";
import { useSelector } from "react-redux";
import { texts } from "./translations";
import Paginate from "@/components/Paginate";

function Order() {
  const navigate = useNavigate();
  const language = useSelector((state: any) => state.language.lang);

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data, isLoading } = useGetOrdersQuery({
    pageNumber: page,
    keyword: searchQuery,
  });

  const orders = data?.orders || [];
  const pages = data?.pages || 1;

  const filteredOrders = orders
    ? orders.filter((order: any) => {
        const query = searchQuery.toLowerCase();
        return (
          order._id?.toLowerCase().includes(query) ||
          order.user?.name?.toLowerCase().includes(query) ||
          order.paymentMethod?.toLowerCase().includes(query)
        );
      })
    : [];

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const StatusBadge = ({ order }: { order: any }) => {
    if (order?.isDelivered) {
      return (
        <Badge variant="success" icon={false} className="p-1 rounded-full">
          {texts[language].delivered}
        </Badge>
      );
    }
    if (order?.isCanceled) {
      return (
        <Badge variant="danger" icon={false} className="p-1 rounded-full">
          {texts[language].canceled}
        </Badge>
      );
    }
    return (
      <Badge variant="pending" icon={false} className="p-1 rounded-full">
        {texts[language].processing}
      </Badge>
    );
  };

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="px-4 flex lg:w-4xl flex-col w-full min-h-screen lg:min-h-auto py-3 mt-[70px]">
          {/* Header */}
          <div className="w-full">
            <div
              className={`flex justify-between items-center flex-wrap gap-3 ${
                language === "ar" ? "justify-end" : ""
              }`}>
              <h1
                dir={language === "ar" ? "rtl" : "ltr"}
                className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-5 items-center flex-wrap">
                {texts[language].orders}:
                <Badge icon={false}>
                  <Layers />
                  <p className="text-lg lg:text-sm">
                    {data?.total > 0 ? data?.total : "0"}{" "}
                    <span className="hidden lg:inline">{texts[language].orders}</span>
                  </p>
                </Badge>
              </h1>
            </div>

            <Separator className="my-4 bg-black/20" />

            {/* Container */}
            <div className="mt-5 mb-2 overflow-hidden w-full max-w-full lg:w-4xl">
              {/* Responsive controls */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 mb-5">
                <div className="relative w-full lg:w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder={texts[language].searchPlaceholder}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full border bg-white border-gray-300 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:gap-2 lg:items-center">
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold rounded-lg p-3 lg:px-4 lg:py-3 text-center">
                    {texts[language].revenue}: {data?.totalRevenue}{" "}
                    {language === "ar" ? "دك" : "KD"}
                  </div>
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold rounded-lg p-3 lg:px-4 lg:py-3 text-center">
                    {texts[language].itemsSold}: {data?.totalItems}
                  </div>
                </div>
              </div>

              {/* Desktop table (unchanged) */}
              <div className="hidden lg:block rounded-lg border lg:p-5 bg-white overflow-x-auto">
                <table className="w-full min-w-[700px] rounded-lg border-gray-200 text-sm text-left text-gray-700">
                  <thead className="bg-white text-gray-900/50 font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b whitespace-nowrap">
                        {texts[language].orderId}
                      </th>
                      <th className="px-4 py-3 border-b whitespace-nowrap">
                        {texts[language].customer}
                      </th>
                      <th className="px-4 py-3 border-b whitespace-nowrap">
                        {texts[language].payment}
                      </th>
                      <th className="px-4 py-3 border-b whitespace-nowrap">
                        {texts[language].items}
                      </th>
                      <th className="px-4 py-3 border-b whitespace-nowrap">
                        {texts[language].createdAt}
                      </th>
                      <th className="px-4 py-3 border-b whitespace-nowrap">
                        {texts[language].status}
                      </th>
                      <th className="px-4 py-3 border-b whitespace-nowrap">
                        {texts[language].total}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredOrders?.length ? (
                      filteredOrders?.map((order: any) => (
                        <tr
                          key={order?._id}
                          className="cursor-pointer hover:bg-gray-100 transition-all duration-300 font-bold"
                          onClick={() => navigate(`/orders/${order?._id}`)}>
                          <td className="px-4 py-5 max-w-20 truncate whitespace-nowrap">
                            #{order._id}
                          </td>
                          <td className="px-4 py-5 whitespace-nowrap">{order?.user?.name}</td>
                          <td className="px-4 py-5 whitespace-nowrap">{order?.paymentMethod}</td>
                          <td className="px-4 py-5 whitespace-nowrap">
                            {order?.orderItems?.length}
                          </td>
                          <td className="px-4 py-5 whitespace-nowrap">
                            {order?.createdAt?.substring(0, 10)}
                          </td>
                          <td className="whitespace-nowrap">
                            <StatusBadge order={order} />
                          </td>
                          <td className="px-4 py-5 whitespace-nowrap">
                            {order?.totalPrice?.toFixed(3)} KD
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-6 text-center text-gray-500 whitespace-nowrap">
                          {texts[language].noOrders}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <Paginate page={page} pages={pages} setPage={setPage} />
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden">
                {filteredOrders?.length ? (
                  <div className="space-y-3">
                    {filteredOrders.map((order: any) => (
                      <button
                        key={order?._id}
                        type="button"
                        onClick={() => navigate(`/orders/${order?._id}`)}
                        className="w-full text-left rounded-xl border bg-white p-4 active:scale-[0.99] transition">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            {/* ✅ Mobile title is USER NAME (instead of ID) */}
                            <p className="font-black text-sm text-neutral-900 truncate">
                              {order?.user?.name || texts[language].customer}
                            </p>

                            {/* ✅ Secondary line shows order id (small) */}
                            <p className="text-xs text-neutral-500 mt-0.5 truncate">
                              #{order?._id}
                            </p>
                          </div>

                          <div className="shrink-0">
                            <StatusBadge order={order} />
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg bg-neutral-50 border px-3 py-2">
                            <p className="text-neutral-500">{texts[language].payment}</p>
                            <p className="font-bold text-neutral-900 truncate">
                              {order?.paymentMethod || "-"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-neutral-50 border px-3 py-2">
                            <p className="text-neutral-500">{texts[language].items}</p>
                            <p className="font-bold text-neutral-900">
                              {order?.orderItems?.length ?? 0}
                            </p>
                          </div>

                          <div className="rounded-lg bg-neutral-50 border px-3 py-2">
                            <p className="text-neutral-500">{texts[language].createdAt}</p>
                            <p className="font-bold text-neutral-900">
                              {order?.createdAt?.substring(0, 10) || "-"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-neutral-50 border px-3 py-2">
                            <p className="text-neutral-500">{texts[language].total}</p>
                            <p className="font-bold text-neutral-900">
                              {order?.totalPrice?.toFixed(3)} KD
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">
                    {texts[language].noOrders}
                  </div>
                )}

                <Paginate page={page} pages={pages} setPage={setPage} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Order;
