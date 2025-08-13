import Layout from "../../Layout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { ChangeEvent } from "react";
import Badge from "../../components/Badge";
import { useGetOrdersQuery } from "../../redux/queries/orderApi";
import { Layers, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Loader from "../../components/Loader";

interface User {
  _id: string;
  name: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
}

interface Order {
  _id: string;
  user: User;
  orderItems: OrderItem[];
  paymentMethod: string;
  totalPrice: number;
  shippingPrice: number;
  createdAt: string;
  isDelivered: boolean;
  isCanceled: boolean;
}

function Order() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useGetOrdersQuery(undefined);

  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filtered orders based on the search query
  const filteredOrders = orders?.filter((order: any) => {
    const query = searchQuery.toLowerCase();
    return (
      order._id.toLowerCase().includes(query) ||
      order.user?.name?.toLowerCase().includes(query) ||
      order.paymentMethod?.toLowerCase().includes(query)
    );
  });

  const totalRevenue = filteredOrders
    ?.reduce((acc: any, order: any) => acc + order.totalPrice, 0)
    .toFixed(3);

  const totalItems = filteredOrders?.reduce(
    (acc: any, order: any) => acc + order.orderItems.length,
    0
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="lg:px-4 flex flex-col w-full min-h-screen lg:min-h-auto py-3 mt-[50px] px-2 lg:ml-[50px]">
          {/* Header */}
          <div className="w-full">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h1 className="text-base lg:text-2xl font-black flex gap-2 lg:gap-5 items-center flex-wrap">
                Orders:
                <Badge icon={"false"}>
                  <Layers />
                  {orders?.length > 0 ? orders.length : "0"} orders
                </Badge>
              </h1>
            </div>
            <Separator className="my-4 bg-black/20" />

            {/* Container with responsive width */}
            <div className="mt-10 mb-2 overflow-hidden w-full max-w-full lg:w-4xl">
              {/* Search Box + Revenue stats */}
              <div className="flex flex-col lg:flex-row items-center gap-4 mb-5">
                <div className="relative w-full lg:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by ID, Name, or Payment"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full border bg-white border-gray-300 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
                  />
                </div>

                <div className="flex flex-wrap gap-2 lg:gap-4 items-center w-full justify-start">
                  {/* Total Revenue Display */}
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold rounded-lg p-3 lg:px-4 lg:py-3 min-w-[140px] text-center">
                    Revenue: {totalRevenue} KD
                  </div>

                  {/* Total Items Display */}
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold rounded-lg p-3 lg:px-4 lg:py-3 min-w-[140px] text-center">
                    Items Sold: {totalItems} items
                  </div>
                </div>
              </div>

              {/* Table wrapper with horizontal scroll on small screens */}
              <div className="rounded-lg border lg:p-10 bg-white overflow-x-auto">
                <table className="w-full min-w-[700px] rounded-lg border-gray-200 text-sm text-left text-gray-700">
                  <thead className="bg-white text-gray-900/50 font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b whitespace-nowrap">Id</th>
                      <th className="px-4 py-3 border-b whitespace-nowrap">Name</th>
                      <th className="px-4 py-3 border-b whitespace-nowrap">Payment</th>
                      <th className="px-4 py-3 border-b whitespace-nowrap">Items</th>
                      <th className="px-4 py-3 border-b whitespace-nowrap">Created At</th>
                      <th className="px-4 py-3 border-b whitespace-nowrap">Status</th>
                      <th className="px-4 py-3 border-b whitespace-nowrap">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredOrders?.length ? (
                      filteredOrders.map((order: Order) => (
                        <tr
                          key={order._id}
                          className="cursor-pointer hover:bg-gray-100 transition-all duration-300 font-bold"
                          onClick={() => navigate(`/admin/orders/${order._id}`)}>
                          <td className="px-4 py-5 max-w-20 truncate whitespace-nowrap">
                            #{order._id}
                          </td>
                          <td className="px-4 py-5 whitespace-nowrap">{order.user.name}</td>
                          <td className="px-4 py-5 whitespace-nowrap">{order.paymentMethod}</td>
                          <td className="px-4 py-5 whitespace-nowrap">{order.orderItems.length}</td>
                          <td className="px-4 py-5 whitespace-nowrap">
                            {order.createdAt.substring(0, 10)}
                          </td>
                          <td className="px-4 py-5 whitespace-nowrap">
                            {order.isDelivered ? (
                              <p className="bg-teal-50 py-1 rounded-xl text-teal-600 text-center border-teal-100 border">
                                Delivered
                              </p>
                            ) : order.isCanceled ? (
                              <p className="bg-rose-50 py-1 rounded-xl text-rose-600 text-center border-orange-100 border">
                                Canceled
                              </p>
                            ) : (
                              <p className="bg-orange-50 py-1 rounded-xl text-orange-600 text-center border-orange-100 border">
                                Processing
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-5 whitespace-nowrap">
                            {(Number(order.totalPrice) + Number(order.shippingPrice)).toFixed(3)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-6 text-center text-gray-500 whitespace-nowrap">
                          No matching orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Order;
