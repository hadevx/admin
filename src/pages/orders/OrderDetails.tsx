import Layout from "../../Layout";
import {
  useGetOrderQuery,
  useUpdateOrderToDeliverdMutation,
  useUpdateOrderToCanceledMutation,
} from "../../redux/queries/orderApi";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Badge from "../../components/Badge";
import clsx from "clsx";
import { Separator } from "../../components/ui/separator";
import Loader from "../../components/Loader";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Invoise from "../../components/Invoise";
import { Loader2Icon } from "lucide-react";
import { useSelector } from "react-redux";

function OrderDetails() {
  const { orderId } = useParams();
  const { data: order, isLoading, refetch } = useGetOrderQuery(orderId);
  const [updateOrderToDeliverd, { isLoading: loadingDelivered }] =
    useUpdateOrderToDeliverdMutation();
  const [updateOrderToCanceled, { isLoading: isCanceled }] = useUpdateOrderToCanceledMutation();

  const language = useSelector((state: any) => state.language.lang); // 'ar' or 'en'

  console.log(order);
  const dir = language === "ar" ? "rtl" : "ltr"; // set text direction

  const handleUpdateOrderToDelivered = async () => {
    try {
      await updateOrderToDeliverd(orderId).unwrap();
      toast.success(
        language === "ar" ? "تم تحديث الطلب إلى تم التسليم" : "Order is updated to delivered"
      );
      refetch();
    } catch (error) {
      toast.error(language === "ar" ? "فشل في تحديث الطلب" : "Failed to update order");
    }
  };

  const handleUpdateOrderToCanceled = async () => {
    try {
      await updateOrderToCanceled(orderId).unwrap();
      toast.success(language === "ar" ? "تم إلغاء الطلب" : "Order is canceled");
      refetch();
    } catch (error) {
      toast.error(language === "ar" ? "فشل في إلغاء الطلب" : "Failed to cancel order");
    }
  };

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div
          className={`mb-10 mt-[50px] min-h-screen w-full lg:w-4xl lg:py-3 lg:mt-[50px] ${
            dir === "rtl" ? "rtl" : "ltr"
          } font-custom`}>
          <div className="px-4 py-6">
            {/* Header */}
            <div
              className="flex gap-2 flex-col lg:flex-row justify-between lg:items-center"
              dir={language === "ar" ? "rtl" : "ltr"}>
              <h1 className="text-lg lg:text-2xl font-bold">
                {language === "ar" ? "تفاصيل الطلب:" : "Order details:"}
              </h1>

              <div className="flex text-xs items-center gap-3 lg:gap-2 sm:justify-end lg:justify-end lg:items-center">
                <button
                  disabled={order?.isDelivered || order?.isCanceled || loadingDelivered}
                  onClick={handleUpdateOrderToDelivered}
                  className={clsx(
                    "select-none hover:opacity-80 lg:text-sm transition-all duration-300 lg:float-right px-3 py-2 rounded-lg font-bold bg-gradient-to-t",
                    order?.isDelivered || order?.isCanceled
                      ? "from-gray-200 to-gray-200 text-gray-600 drop-shadow-[0_4px_6px_rgba(156,163,175,0)] pointer-events-none"
                      : "from-teal-500 to-teal-400 text-white drop-shadow-[0_4px_8px_rgba(20,184,166,0.5)] hover:drop-shadow-[0_6px_12px_rgba(45,212,191,0.5)]"
                  )}>
                  {loadingDelivered
                    ? language === "ar"
                      ? "جارٍ التحديث..."
                      : "Updating..."
                    : language === "ar"
                    ? "تعيين كتم التسليم"
                    : "Mark as delivered"}
                </button>

                {isCanceled ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <button
                    disabled={order?.isDelivered || order?.isCanceled}
                    onClick={handleUpdateOrderToCanceled}
                    className={clsx(
                      "select-none   hover:opacity-70 transition-all duration-300 lg:text-sm px-3 py-2 rounded-lg font-bold shadow lg:float-right bg-gradient-to-t",
                      order?.isCanceled || order?.isDelivered
                        ? "from-gray-200 to-gray-200 text-gray-600 drop-shadow-[0_0_0_rgba(244,63,94,0)] pointer-events-none"
                        : "bg-gradient-to-t from-rose-500 to-rose-400 text-white drop-shadow-[0_4px_8px_rgba(244,63,94,0.5)]"
                    )}>
                    {isCanceled
                      ? language === "ar"
                        ? "جارٍ التحديث..."
                        : "Updating..."
                      : language === "ar"
                      ? "إلغاء الطلب"
                      : "Mark as canceled"}
                  </button>
                )}

                {/* Invoice Download */}
                <PDFDownloadLink
                  document={<Invoise order={order} />}
                  fileName={`invoice-${order?._id}-${order?.createdAt?.substring(0, 10)}.pdf`}>
                  <button className="select-none drop-shadow-[0_4px_8px_rgba(244,63,94,0.5)]  hover:opacity-70 lg:text-sm transition-all duration-300 float-right bg-gradient-to-t from-rose-500 to-rose-400 text-white px-3 py-2 rounded-lg font-bold shadow">
                    {language === "ar" ? "تحميل الفاتورة" : "Download Invoice"}
                  </button>
                </PDFDownloadLink>
              </div>
            </div>

            <Separator className="my-4 bg-black/20" />

            {order && (
              <div
                className="text-sm lg:text-sm bg-white border rounded-lg p-6"
                dir={language === "ar" ? "rtl" : ""}>
                {/* User Info */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                  <h2 className="text-lg font-semibold col-span-full mb-4">
                    رقم الطلب: {order._id}
                  </h2>

                  <div className="flex flex-col text-gray-700">
                    <span className="font-semibold">
                      {language === "ar" ? ":تاريخ الإنشاء" : "Created on:"}
                    </span>
                    <span>{order.createdAt.substring(0, 10)}</span>
                  </div>

                  <div className="flex flex-col text-gray-700">
                    <span className="font-semibold">
                      {language === "ar" ? ":اسم المستخدم" : "User name:"}
                    </span>
                    <span>{order.user.name}</span>
                  </div>

                  <div className="flex flex-col text-gray-700">
                    <span className="font-semibold">
                      {language === "ar" ? ":البريد الإلكتروني" : "User email:"}
                    </span>
                    <span>{order.user.email}</span>
                  </div>

                  <div className="flex flex-col text-gray-700">
                    <span className="font-semibold">
                      {language === "ar" ? ":الهاتف" : "User phone:"}
                    </span>
                    <span>{order.user.phone}</span>
                  </div>
                </div>

                {/* Order Items */}
                {/* Desktop Table */}
                <div className="hidden md:block" dir="ltr">
                  <table className="w-full table-auto border-collapse mb-5">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="py-2 px-2 lg:px-4 text-left">
                          {language === "ar" ? "المنتج" : "Item"}
                        </th>
                        <th className="py-2 px-2 lg:px-4 text-left">
                          {language === "ar" ? "النوع" : "Variants"}
                        </th>
                        <th className="py-2 px-2 lg:px-4 text-left">
                          {language === "ar" ? "الكمية" : "Quantity"}
                        </th>
                        <th className="py-2 px-2 lg:px-4 text-left">
                          {language === "ar" ? "السعر" : "Price"}
                        </th>
                        <th className="py-2 px-2 lg:px-4 text-left">
                          {language === "ar" ? "الإجمالي" : "Total"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order?.orderItems.map((item: any) => (
                        <tr key={item._id} className="border-b">
                          <td className="py-2 px-2 lg:px-4 flex items-center gap-2 max-w-[150px] sm:max-w-[300px]">
                            <img
                              src={item?.variantImage?.[0]?.url || item?.image?.[0]?.url}
                              className="w-10 h-10 md:w-16 md:h-16 object-cover rounded-lg"
                            />
                            <p className="truncate">{item.name}</p>
                          </td>
                          <td className="py-2 px-2 lg:px-4">
                            {item.variantColor && item.variantSize
                              ? `${item.variantColor} / ${item.variantSize}`
                              : "-/-"}
                          </td>
                          <td className="py-2 px-2 lg:px-4">{item.qty}</td>
                          <td className="py-2 px-2 lg:px-4">{item.price.toFixed(3)} KD</td>
                          <td className="py-2 px-2 lg:px-4">
                            {(item.qty * item.price).toFixed(3)} KD
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden mb-5 space-y-2">
                  {order.orderItems.map((item: any, idx: any) => (
                    <div
                      key={`${item._id}-${idx}`}
                      className="border p-3 rounded-xl bg-white  flex gap-3">
                      <img
                        src={item?.variantImage?.[0]?.url || item.image?.[0]?.url}
                        alt={item.name}
                        className="w-32 h-32 object-cover rounded-lg border bg-zinc-100"
                      />
                      <div className="flex-1 space-y-1 text-sm">
                        <p className="font-semibold truncate">{item.name}</p>
                        <p className="text-gray-600">
                          {language === "ar" ? "اللون/الحجم" : "Color/Size"}:{" "}
                          {item.variantColor ?? "-"} / {item.variantSize ?? "-"}
                        </p>
                        <p className="text-gray-600">
                          {language === "ar" ? "السعر" : "Price"}: {item.price.toFixed(3)} KD
                        </p>
                        <p className="text-gray-600">
                          {language === "ar" ? "الكميه" : "Qty"}: {item.qty}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="font-bold">
                            {language === "ar" ? "الإجمالي" : "Total"}:{" "}
                            {(item.qty * item.price).toFixed(3)} KD
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery & Total */}
                <div className="flex gap-5 mb-5" dir={language === "ar" ? "rtl" : "ltr"}>
                  <p>
                    {language === "ar" ? "التوصيل:" : "Delivery:"}{" "}
                    <strong>
                      {order.shippingPrice.toFixed(3)} {language === "ar" ? "دك" : "KD"}
                    </strong>
                  </p>
                  <p>
                    {language === "ar" ? " الإجمالي: " : "Total Price:"}{" "}
                    <strong>
                      {order.totalPrice.toFixed(3)}
                      {language === "ar" ? " دك  " : "KD"}
                    </strong>
                  </p>
                </div>

                {/* Shipping Address */}
                <table className="w-full  border-collapse border   mb-5">
                  <tbody>
                    {["governorate", "city", "block", "street", "house"].map((field) => (
                      <tr key={field}>
                        <th className="border  px-3 py-2 font-semibold">
                          {language === "ar"
                            ? field === "governorate"
                              ? "المحافظة"
                              : field === "city"
                              ? "المدينة"
                              : field === "block"
                              ? "القطعة"
                              : field === "street"
                              ? "الشارع"
                              : "المنزل"
                            : field.charAt(0).toUpperCase() + field.slice(1)}
                        </th>
                        <td className="border  px-3 py-2">{order.shippingAddress[field]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Payment & Status */}
                <div
                  className="flex flex-col  border sm:flex-row sm:justify-between items-end gap-4 p-4 rounded-lg "
                  dir="ltr">
                  <p
                    className={`flex items-center gap-3 text-gray-700 font-medium ${
                      language === "ar" ? "flex-row-reverse" : ""
                    }`}>
                    <span className="font-semibold">
                      {language === "ar" ? ":طريقة الدفع" : "Payment Method:"}
                    </span>{" "}
                    {order.paymentMethod}
                  </p>

                  <div
                    className={`flex items-center gap-3 text-gray-700 font-medium ${
                      language === "ar" ? "flex-row-reverse" : ""
                    }`}>
                    <span className="font-semibold">
                      {language === "ar" ? ":حالة الطلب" : "Order status:"}
                    </span>
                    {order.isDelivered ? (
                      <Badge variant="success">
                        {language === "ar" ? "تم التسليم" : "Delivered"}{" "}
                        {order.deliveredAt?.substring(0, 10)}
                      </Badge>
                    ) : order.isCanceled ? (
                      <Badge variant="danger">
                        {language === "ar" ? "تم الإلغاء" : "Canceled"}
                      </Badge>
                    ) : (
                      <Badge variant="pending">
                        {language === "ar" ? "قيد المعالجة" : "Processing"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default OrderDetails;
