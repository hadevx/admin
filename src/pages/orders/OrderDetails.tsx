// import { useRef } from "react";
import Layout from "../../Layout";
import {
  useGetOrderQuery,
  useUpdateOrderToDeliverdMutation,
  useUpdateOrderToCanceledMutation,
} from "../../redux/queries/orderApi";
import { useParams } from "react-router-dom";
// import { useGetDeliveryStatusQuery } from "../../redux/queries/productApi";
import { toast } from "react-toastify";
import Badge from "../../components/Badge";
import clsx from "clsx";
import { Separator } from "../../components/ui/separator";
import Loader from "../../components/Loader";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Invoise from "../../components/Invoise";
import { Loader2Icon } from "lucide-react";

function OrderDetails() {
  const { orderId } = useParams();
  const { data: order, isLoading, refetch } = useGetOrderQuery(orderId);
  // const { data: deliveryStatus } = useGetDeliveryStatusQuery(undefined);
  const [updateOrderToDeliverd] = useUpdateOrderToDeliverdMutation();
  const [updateOrderToCanceled, { isLoading: isCanceled }] = useUpdateOrderToCanceledMutation();

  console.log(order);

  const handleUpdateOrderToDelivered = async () => {
    if (order) {
      await updateOrderToDeliverd(orderId);
      toast.success("Order is updated to delivered");
      refetch();
    }
  };
  const handleUpdateOrderToCanceled = async () => {
    if (order) {
      await updateOrderToCanceled(orderId);
      toast.success("Order is canceled");
      refetch();
    }
  };

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div className=" mb-10 mt-[50px] min-h-screen  w-full lg:w-4xl lg:py-3 lg:mt-[50px]  lg:ml-[50px] ">
          <div className=" px-4 py-6">
            <div className="flex gap-2 flex-col lg:flex-row  justify-between lg:items-center">
              <h1 className="text-lg  lg:text-2xl font-bold">Order details:</h1>
              <div className="flex  text-xs items-center gap-3  lg:gap-2  lg:justify-end lg:items-center  ">
                <button
                  disabled={order?.isDelivered}
                  onClick={handleUpdateOrderToDelivered}
                  className={clsx(
                    "select-none  hover:opacity-70   transition-all duration-300  lg:float-right bg-gradient-to-t    px-3 py-2 rounded-lg font-bold shadow",
                    order?.isDelivered
                      ? "from-gray-200 to-gray-200 text-gray-600"
                      : "from-teal-500 to-teal-400 text-white"
                  )}>
                  Mark as delivered
                </button>
                {isCanceled ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <button
                    disabled={order?.isDelivered || order?.isCanceled} // disable if delivered or canceled
                    onClick={handleUpdateOrderToCanceled}
                    className={clsx(
                      "select-none hover:opacity-70 transition-all duration-300    px-3 py-2 rounded-lg font-bold shadow lg:float-right bg-gradient-to-t",
                      order?.isCanceled || order.isDelivered
                        ? "from-gray-200 to-gray-200 text-gray-600"
                        : "from-red-500 to-red-400 text-white"
                    )}>
                    Mark as canceled
                  </button>
                )}
                {/* Invoise */}
                <PDFDownloadLink
                  document={<Invoise order={order} />}
                  fileName={`invoice-${order?._id}-${order?.createdAt?.substring(0, 10)}.pdf`}>
                  <button className="select-none   hover:opacity-70  transition-all duration-300  float-right bg-gradient-to-t  from-rose-500 to-rose-400 text-white    px-3 py-2 rounded-lg font-bold shadow">
                    Download Invoice
                  </button>
                </PDFDownloadLink>

                {/* -- */}
              </div>
            </div>
            <Separator className="my-4 bg-black/20" />

            {isLoading ? (
              <Loader />
            ) : (
              order && (
                <>
                  <div className="text-sm lg:text-sm   bg-white shadow rounded-lg p-6 ">
                    <div className="grid  grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                      <h2 className="text-lg font-semibold col-span-full mb-4">
                        Order ID: {order._id}
                      </h2>

                      <div className="flex flex-col text-gray-700">
                        <span className="font-semibold">Created on:</span>
                        <span>{order.createdAt.substring(0, 10)}</span>
                      </div>

                      <div className="flex flex-col text-gray-700">
                        <span className="font-semibold">User name:</span>
                        <span>{order.user.name}</span>
                      </div>

                      <div className="flex flex-col text-gray-700">
                        <span className="font-semibold">User email:</span>
                        <span>{order.user.email}</span>
                      </div>

                      <div className="flex flex-col text-gray-700">
                        <span className="font-semibold">User phone:</span>
                        <span>{order.user.phone}</span>
                      </div>
                    </div>

                    {/* <h3 className="text-xs lg:text-xl font-semibold mb-2">Items:</h3> */}
                    <table className="w-full table-auto  border-collapse mb-5">
                      <thead>
                        <tr className="bg-gray-100  border-b">
                          <th className="py-2 px-2 lg:px-4 text-left">Item</th>
                          <th className="py-2 px-2 lg:px-4 text-left">Quantity</th>
                          <th className="py-2 px-2 lg:px-4 text-left">Price</th>
                          <th className="py-2 px-2 lg:px-4 text-left">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order?.orderItems.map((item: any) => (
                          <tr key={item._id} className="border-b ">
                            <td className="py-2 px-2 lg:px-4">{item.name}</td>
                            <td className="py-2 px-2 lg:px-4">{item.qty}</td>
                            <td className="py-2 px-2 lg:px-4">{item.price.toFixed(3)} KD</td>
                            <td className="py-2 px-2 lg:px-4">
                              {(item.qty * item.price).toFixed(3)} KD
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <h3 className=" font-semibold mb-2">
                      Shipping Fees: {order?.shippingPrice.toFixed(3)} KD
                    </h3>
                    <h3 className=" font-semibold mb-5 ">
                      Total Price: {order?.totalPrice.toFixed(3)} KD
                    </h3>
                    <table className="w-full text-left border-collapse border border-gray-300 text-gray-700 mb-5">
                      <tbody>
                        <tr>
                          <th className="border border-gray-300 px-3 py-2 font-semibold">
                            Governorate
                          </th>
                          <td className="border border-gray-300 px-3 py-2">
                            {order?.shippingAddress?.governorate}
                          </td>
                        </tr>
                        <tr>
                          <th className="border border-gray-300 px-3 py-2 font-semibold">City</th>
                          <td className="border border-gray-300 px-3 py-2">
                            {order?.shippingAddress?.city}
                          </td>
                        </tr>
                        <tr>
                          <th className="border border-gray-300 px-3 py-2 font-semibold">Block</th>
                          <td className="border border-gray-300 px-3 py-2">
                            {order?.shippingAddress?.block}
                          </td>
                        </tr>
                        <tr>
                          <th className="border border-gray-300 px-3 py-2 font-semibold">Street</th>
                          <td className="border border-gray-300 px-3 py-2">
                            {order?.shippingAddress?.street}
                          </td>
                        </tr>
                        <tr>
                          <th className="border border-gray-300 px-3 py-2 font-semibold">House</th>
                          <td className="border border-gray-300 px-3 py-2">
                            {order?.shippingAddress?.house}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 bg-gray-50 p-4 rounded-lg shadow-sm">
                      <p className="text-gray-700 font-medium">
                        <span className="font-semibold">Payment Method:</span>{" "}
                        {order?.paymentMethod}
                      </p>

                      <div className="flex items-center gap-3 text-gray-700 font-medium">
                        <span className="font-semibold">Order status:</span>
                        {order?.isDelivered ? (
                          <Badge variant="success">
                            Delivered on {order?.deliveredAt?.substring(0, 10)}
                          </Badge>
                        ) : order?.isCanceled ? (
                          <Badge variant="danger">Canceled</Badge>
                        ) : (
                          <Badge variant="pending">Processing</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* <div className="flex text-xs lg:text-lg gap-2 justify-start items-start lg:justify-end lg:items-center  lg:gap-5">
                    <button
                      disabled={order?.isDelivered}
                      onClick={handleUpdateOrderToDelivered}
                      className={clsx(
                        "select-none mt-5   transition-all duration-300  lg:float-right bg-gradient-to-t p-1   lg:px-3 lg:py-2 rounded-lg font-bold shadow-md",
                        order?.isDelivered
                          ? "from-gray-200 to-gray-200 text-gray-600"
                          : "from-teal-500 to-teal-400 text-white"
                      )}>
                      Mark as delivered
                    </button>
                    {isCanceled ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      <button
                        disabled={order?.isDelivered || order?.isCanceled} // disable if delivered or canceled
                        onClick={handleUpdateOrderToCanceled}
                        className={clsx(
                          "select-none mt-5 transition-all duration-300 p-1   lg:px-3 lg:py-2 rounded-lg font-bold shadow-md lg:float-right bg-gradient-to-t",
                          order?.isCanceled || order.isDelivered
                            ? "from-gray-200 to-gray-200 text-gray-600"
                            : "from-red-500 to-red-400 text-white"
                        )}>
                        Mark as canceled
                      </button>
                    )}
                   
                    <PDFDownloadLink
                      document={<Invoise order={order} />}
                      fileName={`invoice-${order?._id}-${order?.createdAt?.substring(0, 10)}.pdf`}>
                      <button className="select-none mt-5  transition-all duration-300  float-right bg-gradient-to-t   from-rose-500 to-rose-400 text-white p-1   lg:px-3 lg:py-2 rounded-lg font-bold shadow-md">
                        Download Invoice
                      </button>
                    </PDFDownloadLink>

                  
                  </div> */}
                </>
              )
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default OrderDetails;
