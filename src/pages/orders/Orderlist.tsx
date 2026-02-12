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
        <div className="px-4 flex lg:w-4xl flex-col w-full min-h-screen lg:min-h-auto py-3 mt-[70px] text-neutral-900 dark:text-neutral-100">
          {/* Header */}
          <div className="w-full">
            <div
              className={`flex justify-between items-center flex-wrap gap-3 ${
                language === "ar" ? "justify-end" : ""
              }`}>
              <h1
                dir={language === "ar" ? "rtl" : "ltr"}
                className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-5 items-center flex-wrap text-neutral-900 dark:text-neutral-50">
                {texts[language].orders}:
                <Badge icon={false}>
                  <Layers className="size-5 sm:size-6" />
                  <p className="text-sm lg:text-sm">
                    {data?.total > 0 ? data?.total : "0"}{" "}
                    <span className="hidden lg:inline">{texts[language].orders}</span>
                  </p>
                </Badge>
              </h1>
            </div>

            <Separator className="my-4 bg-black/20 dark:bg-white/10" />

            {/* Container */}
            <div className="mt-5 mb-2 overflow-hidden w-full max-w-full lg:w-4xl">
              {/* ✅ Controls: search FULL width (always) */}
              <div className="w-full space-y-3 mb-5">
                {/* Search (full width) */}
                <div className="relative w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder={texts[language].searchPlaceholder}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="
                      w-full rounded-lg py-3 pl-10 pr-4 text-sm outline-none transition
                      border bg-white border-gray-300 text-neutral-900
                      focus:border-blue-500 focus:border-2
                      dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500
                      dark:focus:border-sky-400
                    "
                  />
                </div>

                {/* Revenue + items */}
                <div className="grid grid-cols-2 gap-2 w-full">
                  <div
                    className="
                      text-sm font-semibold rounded-lg p-3 text-center
                      bg-blue-50 border border-blue-200 text-blue-700
                      dark:bg-sky-950/30 dark:border-sky-900/60 dark:text-sky-200
                    ">
                    {texts[language].revenue}: {data?.totalRevenue}{" "}
                    {language === "ar" ? "دك" : "KD"}
                  </div>
                  <div
                    className="
                      text-sm font-semibold rounded-lg p-3 text-center
                      bg-blue-50 border border-blue-200 text-blue-700
                      dark:bg-sky-950/30 dark:border-sky-900/60 dark:text-sky-200
                    ">
                    {texts[language].itemsSold}: {data?.totalItems}
                  </div>
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block rounded-lg border lg:p-5 bg-white overflow-x-auto dark:bg-neutral-950 dark:border-neutral-800">
                <table className="w-full min-w-[700px] rounded-lg text-sm text-left text-gray-700 dark:text-neutral-200">
                  <thead className="bg-white text-gray-900/50 font-semibold dark:bg-neutral-950 dark:text-neutral-400">
                    <tr>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800 whitespace-nowrap">
                        {texts[language].orderId}
                      </th>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800 whitespace-nowrap">
                        {texts[language].customer}
                      </th>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800 whitespace-nowrap">
                        {texts[language].payment}
                      </th>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800 whitespace-nowrap">
                        {texts[language].items}
                      </th>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800 whitespace-nowrap">
                        {texts[language].createdAt}
                      </th>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800 whitespace-nowrap">
                        {texts[language].status}
                      </th>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800 whitespace-nowrap">
                        {texts[language].total}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-neutral-800 dark:bg-neutral-950">
                    {filteredOrders?.length ? (
                      filteredOrders?.map((order: any) => (
                        <tr
                          key={order?._id}
                          className="
                            cursor-pointer transition-all duration-300 font-bold
                            hover:bg-gray-100
                            dark:hover:bg-neutral-900/60
                          "
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
                          className="px-4 py-6 text-center text-gray-500 dark:text-neutral-500 whitespace-nowrap">
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
                        className="
                          w-full text-left rounded-xl border p-4 transition active:scale-[0.99]
                          bg-white border-gray-200
                          dark:bg-neutral-950 dark:border-neutral-800
                        ">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-black text-sm text-neutral-900 dark:text-neutral-50 truncate">
                              {order?.user?.name || texts[language].customer}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                              #{order?._id}
                            </p>
                          </div>

                          <div className="shrink-0">
                            <StatusBadge order={order} />
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg border px-3 py-2 bg-neutral-50 dark:bg-neutral-900/40 dark:border-neutral-800">
                            <p className="text-neutral-500 dark:text-neutral-400">
                              {texts[language].payment}
                            </p>
                            <p className="font-bold text-neutral-900 dark:text-neutral-50 truncate">
                              {order?.paymentMethod || "-"}
                            </p>
                          </div>

                          <div className="rounded-lg border px-3 py-2 bg-neutral-50 dark:bg-neutral-900/40 dark:border-neutral-800">
                            <p className="text-neutral-500 dark:text-neutral-400">
                              {texts[language].items}
                            </p>
                            <p className="font-bold text-neutral-900 dark:text-neutral-50">
                              {order?.orderItems?.length ?? 0}
                            </p>
                          </div>

                          <div className="rounded-lg border px-3 py-2 bg-neutral-50 dark:bg-neutral-900/40 dark:border-neutral-800">
                            <p className="text-neutral-500 dark:text-neutral-400">
                              {texts[language].createdAt}
                            </p>
                            <p className="font-bold text-neutral-900 dark:text-neutral-50">
                              {order?.createdAt?.substring(0, 10) || "-"}
                            </p>
                          </div>

                          <div className="rounded-lg border px-3 py-2 bg-neutral-50 dark:bg-neutral-900/40 dark:border-neutral-800">
                            <p className="text-neutral-500 dark:text-neutral-400">
                              {texts[language].total}
                            </p>
                            <p className="font-bold text-neutral-900 dark:text-neutral-50">
                              {order?.totalPrice?.toFixed(3)} KD
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-500 dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-500">
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
