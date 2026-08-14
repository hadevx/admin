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
import {
  Loader2Icon,
  TicketPercent,
  BadgePercent,
  Hash,
  CheckCircle2,
  XCircle,
  Download,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useState } from "react";
import ReasonDialog from "../../components/ReasonDialog";

function OrderDetails() {
  const { orderId } = useParams();
  const [cancelOpen, setCancelOpen] = useState(false);
  const { data: order, isLoading, refetch } = useGetOrderQuery(orderId);
  const [updateOrderToDeliverd, { isLoading: loadingDelivered }] =
    useUpdateOrderToDeliverdMutation();
  const [updateOrderToCanceled, { isLoading: isCanceled }] = useUpdateOrderToCanceledMutation();

  const language = useSelector((state: any) => state.language.lang); // 'ar' or 'en'

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

  const handleUpdateOrderToCanceled = async (cancelReason: string) => {
    try {
      await updateOrderToCanceled({ orderId: orderId as string, cancelReason }).unwrap();
      toast.success(language === "ar" ? "تم إلغاء الطلب" : "Order is canceled");
      setCancelOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          (language === "ar" ? "فشل في إلغاء الطلب" : "Failed to cancel order"),
      );
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
        <div className="me-auto w-full max-w-5xl animate-fade-up">
          <div>
            {/* Header */}
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  {language === "ar" ? "تفاصيل الطلب" : "Order details"}
                </h1>
                <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                  #{order?._id}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled={order?.isDelivered || order?.isCanceled || loadingDelivered}
                  onClick={handleUpdateOrderToDelivered}
                  className="ws-btn-primary ws-btn-sm">
                  {loadingDelivered ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
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
                  <button className="ws-btn-secondary ws-btn-sm">
                    <Download className="size-4" />
                    {language === "ar" ? "تحميل الفاتورة" : "Download Invoice"}
                  </button>
                </PDFDownloadLink>

                <button
                  disabled={order?.isDelivered || order?.isCanceled || isCanceled}
                  onClick={() => setCancelOpen(true)}
                  className="ws-btn-danger ws-btn-sm">
                  {isCanceled ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <XCircle className="size-4" />
                  )}
                  {language === "ar" ? "إلغاء الطلب" : "Mark as canceled"}
                </button>
              </div>
            </div>

            <Separator className="my-4" />

            {order && (
              <div
                className={clsx(
                  "text-sm lg:text-sm border rounded-lg p-6",
                  "border-border bg-card",
                )}
                dir={language === "ar" ? "rtl" : ""}>
                {/* Why this order was cancelled — only when a reason was given */}
                {order.isCanceled && order.cancelReason ? (
                  <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/25 dark:bg-rose-500/10">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
                      <XCircle className="size-4 shrink-0" />
                      <span className="text-sm font-bold">
                        {language === "ar" ? "سبب الإلغاء" : "Cancellation reason"}
                      </span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-foreground">
                      {order.cancelReason}
                    </p>
                    {order.canceledAt ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(order.canceledAt).toLocaleString(
                          language === "ar" ? "ar-KW" : "en-US",
                        )}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {/* User Info */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                  <h2 className="text-lg font-semibold col-span-full mb-4 text-foreground">
                    {language === "ar" ? "رقم الطلب:" : "Order ID:"} {order._id}
                  </h2>

                  <div className="flex flex-col text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {language === "ar" ? "تاريخ الإنشاء:" : "Created on:"}
                    </span>
                    <span className="text-muted-foreground">
                      {order.createdAt.substring(0, 10)}
                    </span>
                  </div>

                  <div className="flex flex-col text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {language === "ar" ? "اسم المستخدم:" : "User name:"}
                    </span>
                    <span className="text-muted-foreground">
                      {order.user.name}
                    </span>
                  </div>

                  <div className="flex flex-col text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {language === "ar" ? "البريد الإلكتروني:" : "User email:"}
                    </span>
                    <span className="text-muted-foreground">
                      {order.user.email}
                    </span>
                  </div>

                  <div className="flex flex-col text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {language === "ar" ? "الهاتف:" : "User phone:"}
                    </span>
                    <span className="text-muted-foreground">
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
                      <div className="rounded-xl border bg-card p-3 flex items-center gap-3 border-border">
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
                      <div className="rounded-xl border bg-card p-3 flex items-center gap-3 border-border">
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
                      <div className="rounded-xl border bg-card p-3 flex items-center gap-3 border-border">
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
                        <th className="py-2 px-2 lg:px-4 text-left text-foreground">
                          {language === "ar" ? "المنتج" : "Item"}
                        </th>
                        <th className="py-2 px-2 lg:px-4 text-left text-foreground">
                          {language === "ar" ? "النوع" : "Variants"}
                        </th>
                        <th className="py-2 px-2 lg:px-4 text-left text-foreground">
                          {language === "ar" ? "الكمية" : "Quantity"}
                        </th>

                        {hasDiscount && (
                          <th className="py-2 px-2 lg:px-4 text-left text-foreground">
                            {language === "ar" ? "قبل الخصم" : "Before discount"}
                          </th>
                        )}
                        {hasDiscount && (
                          <th className="py-2 px-2 lg:px-4 text-left text-foreground">
                            {language === "ar" ? "الخصم" : "Discount"}
                          </th>
                        )}

                        <th className="py-2 px-2 lg:px-4 text-left text-foreground">
                          {language === "ar" ? "السعر" : "Price"}
                        </th>
                        <th className="py-2 px-2 lg:px-4 text-left text-foreground">
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
                            className="border-b border-border">
                            <td className="py-2 px-2 lg:px-4 flex items-center gap-2 max-w-[150px] sm:max-w-[300px]">
                              <img
                                src={item?.variantImage?.[0]?.url || item?.image?.[0]?.url}
                                className="w-10 h-10 md:w-16 md:h-16 object-cover rounded-lg border bg-zinc-100 dark:border-neutral-800 dark:bg-neutral-900/50"
                                alt={item.name}
                              />
                              <p className="break-words text-foreground">
                                {item.name}
                              </p>
                            </td>

                            <td className="py-2 px-2 lg:px-4 text-muted-foreground">
                              {item.variantColor && item.variantSize
                                ? `${item.variantColor} / ${item.variantSize}`
                                : "-/-"}
                            </td>

                            <td className="py-2 px-2 lg:px-4 text-muted-foreground">
                              {qty}
                            </td>

                            {hasDiscount && (
                              <td className="py-2 px-2 lg:px-4 text-muted-foreground line-through">
                                {formatKD(originalUnit)}
                              </td>
                            )}
                            {hasDiscount && (
                              <td className="py-2 px-2 lg:px-4 text-rose-600 dark:text-rose-300">
                                -{formatKD(itemDiscountTotal)}
                              </td>
                            )}

                            <td className="py-2 px-2 lg:px-4 font-semibold text-foreground">
                              {formatKD(finalUnit)}
                            </td>

                            <td className="py-2 px-2 lg:px-4 text-muted-foreground">
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
                          <p className="font-semibold break-words text-foreground">
                            {item.name}
                          </p>

                          <p className="text-muted-foreground">
                            {language === "ar" ? "اللون/الحجم" : "Color/Size"}:{" "}
                            {item.variantColor ?? "-"} / {item.variantSize ?? "-"}
                          </p>

                          {hasDiscount && (
                            <p className="text-muted-foreground line-through">
                              {language === "ar" ? "قبل الخصم" : "Before"}: {formatKD(originalUnit)}
                            </p>
                          )}
                          {hasDiscount && (
                            <p className="text-rose-600 dark:text-rose-300">
                              {language === "ar" ? "الخصم" : "Discount"}: -
                              {formatKD(itemDiscountTotal)}
                            </p>
                          )}

                          <p className="text-muted-foreground">
                            {language === "ar" ? "السعر" : "Price"}: {formatKD(finalUnit)}
                          </p>

                          <p className="text-muted-foreground">
                            {language === "ar" ? "الكميه" : "Qty"}: {qty}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <p className="font-bold text-foreground">
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
                <div className="mb-5 ms-auto w-full max-w-sm">
                  <div className="ws-tile space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "التوصيل" : "Delivery"}
                      </span>
                      <span className="font-bold">{formatKD(order.shippingPrice)}</span>
                    </div>

                    {hasDiscount && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {language === "ar" ? "خصم الكوبون" : "Coupon discount"}
                        </span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          -{formatKD(order.discountAmount)}
                        </span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">
                        {language === "ar" ? "الإجمالي" : "Total"}
                      </span>
                      <span className="text-lg font-extrabold">{formatKD(order.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-5 overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <tbody>
                      {["governorate", "city", "block", "street", "house"].map((field) => (
                        <tr key={field} className="border-b border-border last:border-b-0">
                          <th className="w-40 bg-[var(--surface-muted)] px-3 py-2.5 text-start font-semibold text-muted-foreground">
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
                          <td className="px-3 py-2.5 font-medium">
                            {order.shippingAddress[field]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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
                      "text-muted-foreground",
                      language === "ar" ? "flex-row-reverse" : "",
                    )}>
                    <span className="font-semibold text-foreground">
                      {language === "ar" ? ":طريقة الدفع" : "Payment Method:"}
                    </span>{" "}
                    {order.paymentMethod}
                  </p>

                  <div
                    className={clsx(
                      "flex items-center gap-3 font-medium",
                      "text-muted-foreground",
                      language === "ar" ? "flex-row-reverse" : "",
                    )}>
                    <span className="font-semibold text-foreground">
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

      <ReasonDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        language={language}
        loading={isCanceled}
        title={language === "ar" ? "إلغاء الطلب" : "Cancel this order"}
        description={
          language === "ar"
            ? "لا يمكن التراجع عن الإلغاء. يمكنك إضافة سبب للسجل."
            : "Cancelling can't be undone. You can add a reason for the record."
        }
        placeholder={language === "ar" ? "سبب الإلغاء" : "Cancellation reason"}
        confirmLabel={language === "ar" ? "تأكيد الإلغاء" : "Cancel order"}
        onConfirm={handleUpdateOrderToCanceled}
      />
    </Layout>
  );
}

export default OrderDetails;
