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
import { Loader2Icon, TicketPercent, BadgePercent, Hash } from "lucide-react";
import { useSelector } from "react-redux";

function OrderDetails() {
  const { orderId } = useParams();
  const { data: order, isLoading, refetch } = useGetOrderQuery(orderId);
  const [updateOrderToDeliverd, { isLoading: loadingDelivered }] =
    useUpdateOrderToDeliverdMutation();
  const [updateOrderToCanceled, { isLoading: isCanceled }] = useUpdateOrderToCanceledMutation();

  const language = useSelector((state: any) => state.language.lang); // 'ar' or 'en'
  const dir = language === "ar" ? "rtl" : "ltr";

  const handleUpdateOrderToDelivered = async () => {
    try {
      await updateOrderToDeliverd(orderId).unwrap();
      toast.success(
        language === "ar" ? "تم تحديث الطلب إلى تم التسليم" : "Order is updated to delivered",
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

  // ---------------------------
  // ✅ Coupon/discount helpers
  // ---------------------------
  const hasDiscount =
    !!order &&
    typeof order.discountAmount === "number" &&
    order.discountAmount > 0 &&
    !!order.coupon?.code;

  // distribute total discount across all items by qty (approx)
  const totalQty =
    order?.orderItems?.reduce((sum: number, it: any) => sum + (Number(it?.qty) || 0), 0) || 0;

  const discountPerUnit = hasDiscount && totalQty > 0 ? order.discountAmount / totalQty : 0;

  const formatKD = (n: number) => ` ${Number(n || 0).toFixed(3)} KD`;

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div
          className={clsx(
            "mb-10 mt-[50px] min-h-screen w-full lg:w-4xl lg:py-3 lg:mt-[50px] font-custom",
            dir === "rtl" ? "rtl" : "ltr",
            "text-neutral-900 dark:text-neutral-100",
          )}>
          <div className="px-4 py-6">
            {/* Header */}
            <div
              className="flex gap-2 flex-col lg:flex-row justify-between lg:items-center"
              dir={language === "ar" ? "rtl" : "ltr"}>
              <h1 className="text-lg lg:text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {language === "ar" ? "تفاصيل الطلب:" : "Order details:"}
              </h1>

              <div className="flex text-xs items-center gap-3 lg:gap-2 sm:justify-end lg:justify-end lg:items-center">
                <button
                  disabled={order?.isDelivered || order?.isCanceled || loadingDelivered}
                  onClick={handleUpdateOrderToDelivered}
                  className={clsx(
                    "select-none hover:opacity-80 lg:text-sm transition-all duration-300 lg:float-right px-3 py-2 rounded-md font-bold",
                    order?.isDelivered || order?.isCanceled
                      ? "bg-gray-200 text-gray-600 pointer-events-none dark:bg-neutral-800 dark:text-neutral-400"
                      : "bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950",
                  )}>
                  {loadingDelivered
                    ? language === "ar"
                      ? "جارٍ التحديث..."
                      : "Updating..."
                    : language === "ar"
                      ? "تعيين كتم التسليم"
                      : "Mark as delivered"}
                </button>

                {/* Invoice Download */}
                <PDFDownloadLink
                  document={<Invoise order={order} />}
                  fileName={`invoice-${order?._id}-${order?.createdAt?.substring(0, 10)}.pdf`}>
                  <button
                    className={clsx(
                      "select-none hover:opacity-70 lg:text-sm transition-all duration-300 float-right px-3 py-2 rounded-md font-bold shadow",
                      "bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950",
                    )}>
                    {language === "ar" ? "تحميل الفاتورة" : "Download Invoice"}
                  </button>
                </PDFDownloadLink>

                {isCanceled ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <button
                    disabled={order?.isDelivered || order?.isCanceled}
                    onClick={handleUpdateOrderToCanceled}
                    className={clsx(
                      "select-none hover:opacity-70 transition-all duration-300 lg:text-sm px-3 py-2 rounded-md font-bold shadow lg:float-right",
                      order?.isCanceled || order?.isDelivered
                        ? "bg-gray-200 text-gray-600 pointer-events-none dark:bg-neutral-800 dark:text-neutral-400"
                        : "bg-gradient-to-t from-rose-500 to-rose-400 text-white dark:from-rose-600 dark:to-rose-500",
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
              </div>
            </div>

            <Separator className="my-4 bg-black/20 dark:bg-white/10" />

            {order && (
              <div
                className={clsx(
                  "text-sm lg:text-sm border rounded-lg p-6",
                  "bg-white border-gray-200",
                  "dark:bg-neutral-950 dark:border-neutral-800",
                )}
                dir={language === "ar" ? "rtl" : ""}>
                {/* User Info */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                  <h2 className="text-lg font-semibold col-span-full mb-4 text-neutral-900 dark:text-neutral-50">
                    {language === "ar" ? "رقم الطلب:" : "Order ID:"} {order._id}
                  </h2>

                  <div className="flex flex-col text-gray-700 dark:text-neutral-300">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                      {language === "ar" ? "تاريخ الإنشاء:" : "Created on:"}
                    </span>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {order.createdAt.substring(0, 10)}
                    </span>
                  </div>

                  <div className="flex flex-col text-gray-700 dark:text-neutral-300">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                      {language === "ar" ? "اسم المستخدم:" : "User name:"}
                    </span>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {order.user.name}
                    </span>
                  </div>

                  <div className="flex flex-col text-gray-700 dark:text-neutral-300">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                      {language === "ar" ? "البريد الإلكتروني:" : "User email:"}
                    </span>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {order.user.email}
                    </span>
                  </div>

                  <div className="flex flex-col text-gray-700 dark:text-neutral-300">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                      {language === "ar" ? "الهاتف:" : "User phone:"}
                    </span>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {order.user.phone}
                    </span>
                  </div>
                </div>

                {/* ✅ Better Coupon Summary (ONLY if hasDiscount) */}
                {hasDiscount && (
                  <div
                    className={clsx(
                      "mb-5 rounded-2xl border p-4",
                      "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",
                      "dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-neutral-950",
                    )}>
                    <div
                      className={clsx(
                        "flex items-start justify-between gap-3",
                        language === "ar" ? "flex-row-reverse" : "",
                      )}>
                      <div
                        className={clsx(
                          "flex items-center gap-2",
                          language === "ar" ? "flex-row-reverse" : "",
                        )}>
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/40">
                          <TicketPercent className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-900 dark:text-emerald-200">
                            {language === "ar" ? "تم تطبيق كوبون خصم" : "Coupon Applied"}
                          </p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-300/80">
                            {language === "ar"
                              ? "تم احتساب الخصم ضمن أسعار المنتجات."
                              : "Discount has been included in item prices."}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold dark:bg-emerald-900/40 dark:text-emerald-200">
                        {language === "ar" ? "خصم" : "DISCOUNT"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3" dir="ltr">
                      {/* Code */}
                      <div className="rounded-xl border bg-white p-3 flex items-center gap-3 dark:bg-neutral-950 dark:border-neutral-800">
                        <div className="h-9 w-9 rounded-lg bg-zinc-100 flex items-center justify-center dark:bg-neutral-900/60">
                          <Hash className="h-4 w-4 text-zinc-700 dark:text-neutral-200" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-zinc-500 dark:text-neutral-400">
                            {language === "ar" ? "كود الكوبون" : "Coupon Code"}
                          </p>
                          <p className="font-semibold text-zinc-900 dark:text-neutral-50 truncate">
                            {order.coupon?.code}
                          </p>
                        </div>
                      </div>

                      {/* Total Discount */}
                      <div className="rounded-xl border bg-white p-3 flex items-center gap-3 dark:bg-neutral-950 dark:border-neutral-800">
                        <div className="h-9 w-9 rounded-lg bg-rose-50 flex items-center justify-center dark:bg-rose-950/40">
                          <BadgePercent className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-zinc-500 dark:text-neutral-400">
                            {language === "ar" ? "إجمالي الخصم" : "Total Discount"}
                          </p>
                          <p className="font-semibold text-rose-700 dark:text-rose-300">
                            -{formatKD(order.discountAmount)}
                          </p>
                        </div>
                      </div>

                      {/* Per Unit (approx) */}
                      <div className="rounded-xl border bg-white p-3 flex items-center gap-3 dark:bg-neutral-950 dark:border-neutral-800">
                        <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center dark:bg-emerald-950/40">
                          <TicketPercent className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-zinc-500 dark:text-neutral-400">
                            {language === "ar" ? "خصم لكل قطعة (تقريباً)" : "Per Unit (approx)"}
                          </p>
                          <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                            {formatKD(discountPerUnit)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                {/* Desktop Table */}
                <div className="hidden md:block" dir="ltr">
                  <table className="w-full table-auto border-collapse mb-5">
                    <thead>
                      <tr className="bg-gray-100 border-b dark:bg-neutral-900/60 dark:border-neutral-800">
                        <th className="py-2 px-2 lg:px-4 text-left text-neutral-900 dark:text-neutral-200">
                          {language === "ar" ? "المنتج" : "Item"}
                        </th>
                        <th className="py-2 px-2 lg:px-4 text-left text-neutral-900 dark:text-neutral-200">
                          {language === "ar" ? "النوع" : "Variants"}
                        </th>
                        <th className="py-2 px-2 lg:px-4 text-left text-neutral-900 dark:text-neutral-200">
                          {language === "ar" ? "الكمية" : "Quantity"}
                        </th>

                        {hasDiscount && (
                          <th className="py-2 px-2 lg:px-4 text-left text-neutral-900 dark:text-neutral-200">
                            {language === "ar" ? "قبل الخصم" : "Before discount"}
                          </th>
                        )}
                        {hasDiscount && (
                          <th className="py-2 px-2 lg:px-4 text-left text-neutral-900 dark:text-neutral-200">
                            {language === "ar" ? "الخصم" : "Discount"}
                          </th>
                        )}

                        <th className="py-2 px-2 lg:px-4 text-left text-neutral-900 dark:text-neutral-200">
                          {language === "ar" ? "السعر" : "Price"}
                        </th>
                        <th className="py-2 px-2 lg:px-4 text-left text-neutral-900 dark:text-neutral-200">
                          {language === "ar" ? "الإجمالي" : "Total"}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {order?.orderItems.map((item: any) => {
                        const qty = Number(item?.qty) || 0;

                        // ✅ final unit price saved on order
                        const finalUnit = Number(item?.price) || 0;

                        // ✅ approximate original unit (only if hasDiscount)
                        const originalUnit = hasDiscount ? finalUnit + discountPerUnit : finalUnit;

                        // ✅ per item total discount (only if hasDiscount)
                        const itemDiscountTotal = hasDiscount ? qty * discountPerUnit : 0;

                        const totalFinal = qty * finalUnit;

                        return (
                          <tr
                            key={item._id}
                            className="border-b border-gray-200 dark:border-neutral-800">
                            <td className="py-2 px-2 lg:px-4 flex items-center gap-2 max-w-[150px] sm:max-w-[300px]">
                              <img
                                src={item?.variantImage?.[0]?.url || item?.image?.[0]?.url}
                                className="w-10 h-10 md:w-16 md:h-16 object-cover rounded-lg border bg-zinc-100 dark:border-neutral-800 dark:bg-neutral-900/50"
                                alt={item.name}
                              />
                              <p className="break-words text-neutral-900 dark:text-neutral-100">
                                {item.name}
                              </p>
                            </td>

                            <td className="py-2 px-2 lg:px-4 text-neutral-700 dark:text-neutral-300">
                              {item.variantColor && item.variantSize
                                ? `${item.variantColor} / ${item.variantSize}`
                                : "-/-"}
                            </td>

                            <td className="py-2 px-2 lg:px-4 text-neutral-700 dark:text-neutral-300">
                              {qty}
                            </td>

                            {hasDiscount && (
                              <td className="py-2 px-2 lg:px-4 text-gray-500 dark:text-neutral-500 line-through">
                                {formatKD(originalUnit)}
                              </td>
                            )}
                            {hasDiscount && (
                              <td className="py-2 px-2 lg:px-4 text-rose-600 dark:text-rose-300">
                                -{formatKD(itemDiscountTotal)}
                              </td>
                            )}

                            <td className="py-2 px-2 lg:px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                              {formatKD(finalUnit)}
                            </td>

                            <td className="py-2 px-2 lg:px-4 text-neutral-700 dark:text-neutral-300">
                              {formatKD(totalFinal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden mb-5 space-y-2">
                  {order.orderItems.map((item: any, idx: any) => {
                    const qty = Number(item?.qty) || 0;
                    const finalUnit = Number(item?.price) || 0;
                    const originalUnit = hasDiscount ? finalUnit + discountPerUnit : finalUnit;
                    const itemDiscountTotal = hasDiscount ? qty * discountPerUnit : 0;

                    return (
                      <div
                        key={`${item._id}-${idx}`}
                        className="border p-3 rounded-xl bg-white flex gap-3 dark:bg-neutral-950 dark:border-neutral-800">
                        <img
                          src={item?.variantImage?.[0]?.url || item.image?.[0]?.url}
                          alt={item.name}
                          className="w-32 h-32 object-cover rounded-lg border bg-zinc-100 dark:border-neutral-800 dark:bg-neutral-900/50"
                        />

                        <div className="flex-1 space-y-1 text-sm">
                          <p className="font-semibold break-words text-neutral-900 dark:text-neutral-50">
                            {item.name}
                          </p>

                          <p className="text-gray-600 dark:text-neutral-400">
                            {language === "ar" ? "اللون/الحجم" : "Color/Size"}:{" "}
                            {item.variantColor ?? "-"} / {item.variantSize ?? "-"}
                          </p>

                          {hasDiscount && (
                            <p className="text-gray-500 dark:text-neutral-500 line-through">
                              {language === "ar" ? "قبل الخصم" : "Before"}: {formatKD(originalUnit)}
                            </p>
                          )}
                          {hasDiscount && (
                            <p className="text-rose-600 dark:text-rose-300">
                              {language === "ar" ? "الخصم" : "Discount"}: -
                              {formatKD(itemDiscountTotal)}
                            </p>
                          )}

                          <p className="text-gray-600 dark:text-neutral-400">
                            {language === "ar" ? "السعر" : "Price"}: {formatKD(finalUnit)}
                          </p>

                          <p className="text-gray-600 dark:text-neutral-400">
                            {language === "ar" ? "الكميه" : "Qty"}: {qty}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <p className="font-bold text-neutral-900 dark:text-neutral-50">
                              {language === "ar" ? "الإجمالي" : "Total"}:{" "}
                              {formatKD(qty * finalUnit)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Delivery & Total */}
                <div className="flex flex-col gap-2 mb-5" dir={language === "ar" ? "rtl" : "ltr"}>
                  <p className="text-neutral-800 dark:text-neutral-200">
                    {language === "ar" ? "التوصيل:" : "Delivery:"}{" "}
                    <strong>{formatKD(order.shippingPrice)}</strong>
                  </p>

                  {hasDiscount && (
                    <p className="text-rose-600 dark:text-rose-300 font-semibold">
                      {language === "ar" ? "خصم الكوبون:" : "Coupon Discount:"} -{" "}
                      {formatKD(order.discountAmount)}
                    </p>
                  )}

                  <p className="text-neutral-800 dark:text-neutral-200">
                    {language === "ar" ? " الإجمالي: " : "Total Price:"}{" "}
                    <strong>{formatKD(order.totalPrice)}</strong>
                  </p>
                </div>

                {/* Shipping Address */}
                <table className="w-full border-collapse border mb-5 border-gray-200 dark:border-neutral-800">
                  <tbody>
                    {["governorate", "city", "block", "street", "house"].map((field) => (
                      <tr key={field} className="dark:border-neutral-800">
                        <th className="border px-3 py-2 font-semibold border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/60 text-neutral-900 dark:text-neutral-200">
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
                        <td className="border px-3 py-2 border-gray-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-300">
                          {order.shippingAddress[field]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Payment & Status */}
                <div
                  className={clsx(
                    "flex flex-col border sm:flex-row sm:justify-between items-end gap-4 p-4 rounded-lg",
                    "border-gray-200 bg-white",
                    "dark:border-neutral-800 dark:bg-neutral-950",
                  )}
                  dir="ltr">
                  <p
                    className={clsx(
                      "flex items-center gap-3 font-medium",
                      "text-gray-700 dark:text-neutral-300",
                      language === "ar" ? "flex-row-reverse" : "",
                    )}>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                      {language === "ar" ? ":طريقة الدفع" : "Payment Method:"}
                    </span>{" "}
                    {order.paymentMethod}
                  </p>

                  <div
                    className={clsx(
                      "flex items-center gap-3 font-medium",
                      "text-gray-700 dark:text-neutral-300",
                      language === "ar" ? "flex-row-reverse" : "",
                    )}>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">
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
