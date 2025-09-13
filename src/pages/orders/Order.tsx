import Layout from "../../Layout";
import { useNavigate } from "react-router-dom";
import { useState, type ChangeEvent } from "react";
import Badge from "../../components/Badge";
import { useGetOrdersQuery } from "../../redux/queries/orderApi";
import { Layers, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Loader from "../../components/Loader";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSelector } from "react-redux";
import { texts } from "./translations";
import MobiusBand from "./../../components/MobiusBand";

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
          order._id.toLowerCase().includes(query) ||
          order.user?.name?.toLowerCase().includes(query) ||
          order.paymentMethod?.toLowerCase().includes(query)
        );
      })
    : [];

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Layout>
      <MobiusBand />
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
              <div className="flex flex-col lg:flex-row items-center gap-2 mb-5">
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

                <div className="flex gap-2 items-center w-full">
                  <div className="bg-blue-50 border flex-1 border-blue-200 text-blue-700 text-sm sm:text-sm font-semibold rounded-lg p-3 lg:px-4 lg:py-3 text-center">
                    {texts[language].revenue}: {data?.totalRevenue}{" "}
                    {language === "ar" ? "دك" : "KD"}
                  </div>
                  <div className="bg-blue-50 border flex-1 border-blue-200 text-blue-700 text-sm sm:text-sm font-semibold rounded-lg p-3 lg:px-4 lg:py-3 text-center">
                    {texts[language].itemsSold}: {data?.totalItems}{" "}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-lg border lg:p-5 bg-white overflow-x-auto">
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
                          onClick={() => navigate(`/admin/orders/${order?._id}`)}>
                          <td className="px-4 py-5 max-w-20 truncate whitespace-nowrap">
                            #{order._id}
                          </td>
                          <td className="px-4 py-5 whitespace-nowrap">{order?.user?.name}</td>
                          <td className="px-4 py-5 whitespace-nowrap">{order?.paymentMethod}</td>
                          <td className="px-4 py-5 whitespace-nowrap">
                            {order?.orderItems?.length}
                          </td>
                          <td className="px-4 py-5 whitespace-nowrap">
                            {order?.createdAt.substring(0, 10)}
                          </td>
                          <td className=" whitespace-nowrap">
                            {order?.isDelivered ? (
                              <Badge variant="success" icon={false} className="p-1 rounded-full">
                                {" "}
                                {texts[language].delivered}
                              </Badge>
                            ) : order?.isCanceled ? (
                              <Badge variant="danger" icon={false} className="p-1 rounded-full">
                                {" "}
                                {texts[language].canceled}
                              </Badge>
                            ) : (
                              <Badge variant="pending" icon={false} className="p-1 rounded-full">
                                {" "}
                                {texts[language].processing}
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-5 whitespace-nowrap">
                            {order?.totalPrice.toFixed(3)} KD
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

                {/* Pagination */}
                <Pagination className="py-2">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => page > 1 && setPage(page - 1)} href="#" />
                    </PaginationItem>
                    {[...Array(pages).keys()].map((x) => (
                      <PaginationItem key={x + 1}>
                        <PaginationLink
                          href="#"
                          isActive={page === x + 1}
                          onClick={() => setPage(x + 1)}>
                          {x + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext onClick={() => page < pages && setPage(page + 1)} href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Order;
