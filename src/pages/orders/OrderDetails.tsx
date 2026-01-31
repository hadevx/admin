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
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Truck,
  MapPin,
  Package,
  Download,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useMemo, useState } from "react";

function OrderDetails() {
  const { orderId } = useParams();
  const { data: order, isLoading, refetch } = useGetOrderQuery(orderId);

  const [updateOrderToDeliverd, { isLoading: loadingDelivered }] =
    useUpdateOrderToDeliverdMutation();
  const [updateOrderToCanceled, { isLoading: loadingCanceled }] =
    useUpdateOrderToCanceledMutation();

  const language = useSelector((state: any) => state.language.lang); // 'ar' | 'en'
  const dir = language === "ar" ? "rtl" : "ltr";

  const [copied, setCopied] = useState(false);

  const t = useMemo(() => {
    const ar = {
      title: "تفاصيل الطلب",
      createdOn: "تاريخ الإنشاء",
      userName: "اسم المستخدم",
      userEmail: "البريد الإلكتروني",
      userPhone: "الهاتف",
      markDelivered: "تعيين كتم التسليم",
      markCanceled: "إلغاء الطلب",
      updating: "جارٍ التحديث...",
      delivered: "تم التسليم",
      canceled: "تم الإلغاء",
      processing: "قيد المعالجة",
      downloadInvoice: "تحميل الفاتورة",
      delivery: "التوصيل",
      total: "الإجمالي",
      paymentMethod: "طريقة الدفع",
      orderStatus: "حالة الطلب",
      items: "المنتجات",
      variant: "النوع",
      quantity: "الكمية",
      price: "السعر",
      totalLine: "الإجمالي",
      colorSize: "اللون/الحجم",
      shippingAddress: "عنوان التوصيل",
      governorate: "المحافظة",
      city: "المدينة",
      block: "القطعة",
      street: "الشارع",
      house: "المنزل",
      copy: "نسخ",
      copied: "تم النسخ",
      failedUpdate: "فشل في تحديث الطلب",
      updatedDelivered: "تم تحديث الطلب إلى تم التسليم",
      canceledOk: "تم إلغاء الطلب",
      failedCancel: "فشل في إلغاء الطلب",
      openOrder: "رقم الطلب",
    };
    const en = {
      title: "Order details",
      createdOn: "Created on",
      userName: "User name",
      userEmail: "User email",
      userPhone: "User phone",
      markDelivered: "Mark as delivered",
      markCanceled: "Mark as canceled",
      updating: "Updating...",
      delivered: "Delivered",
      canceled: "Canceled",
      processing: "Processing",
      downloadInvoice: "Download Invoice",
      delivery: "Delivery",
      total: "Total",
      paymentMethod: "Payment Method",
      orderStatus: "Order status",
      items: "Items",
      variant: "Variants",
      quantity: "Quantity",
      price: "Price",
      totalLine: "Total",
      colorSize: "Color/Size",
      shippingAddress: "Shipping Address",
      governorate: "Governorate",
      city: "City",
      block: "Block",
      street: "Street",
      house: "House",
      copy: "Copy",
      copied: "Copied",
      failedUpdate: "Failed to update order",
      updatedDelivered: "Order is updated to delivered",
      canceledOk: "Order is canceled",
      failedCancel: "Failed to cancel order",
      openOrder: "Order ID",
    };
    return language === "ar" ? ar : en;
  }, [language]);

  const status = useMemo(() => {
    if (!order) return "processing";
    if (order?.isDelivered) return "delivered";
    if (order?.isCanceled) return "canceled";
    return "processing";
  }, [order]);

  const subtotal = useMemo(() => {
    if (!order?.orderItems?.length) return 0;
    return order.orderItems.reduce((sum: number, item: any) => sum + item.qty * item.price, 0);
  }, [order]);

  const canEdit = !order?.isDelivered && !order?.isCanceled;

  const handleUpdateOrderToDelivered = async () => {
    try {
      await updateOrderToDeliverd(orderId).unwrap();
      toast.success(t.updatedDelivered);
      refetch();
    } catch {
      toast.error(t.failedUpdate);
    }
  };

  const handleUpdateOrderToCanceled = async () => {
    try {
      await updateOrderToCanceled(orderId).unwrap();
      toast.success(t.canceledOk);
      refetch();
    } catch {
      toast.error(t.failedCancel);
    }
  };

  const handleCopyId = async () => {
    if (!order?._id) return;
    try {
      await navigator.clipboard.writeText(order._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div
          className={clsx("mt-[70px] min-h-screen", "px-4 py-6", dir === "rtl" ? "rtl" : "ltr")}
          dir={dir}>
          <div className=" w-full max-w-4xl">
            {/* Header */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-xl lg:text-3xl font-black text-neutral-950">{t.title}</h1>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm font-bold text-neutral-900">
                    <span className="text-neutral-500">{t.openOrder}:</span>
                    <span className="max-w-[220px] truncate">#{order?._id}</span>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-2 py-1 text-xs font-bold hover:bg-neutral-50 transition">
                      <Copy className="h-3.5 w-3.5" />
                      {copied ? t.copied : t.copy}
                    </button>
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm font-bold text-neutral-900">
                    <Clock className="h-4 w-4 text-neutral-500" />
                    {order?.createdAt?.substring(0, 10)}
                  </span>

                  {status === "delivered" ? (
                    <Badge variant="success" icon={false} className="px-3 py-2 rounded-full">
                      {t.delivered} {order?.deliveredAt?.substring(0, 10)}
                    </Badge>
                  ) : status === "canceled" ? (
                    <Badge variant="danger" icon={false} className="px-3 py-2 rounded-full">
                      {t.canceled}
                    </Badge>
                  ) : (
                    <Badge variant="pending" icon={false} className="px-3 py-2 rounded-full">
                      {t.processing}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <button
                  disabled={!canEdit || loadingDelivered}
                  onClick={handleUpdateOrderToDelivered}
                  className={clsx(
                    "h-10 px-4 rounded-2xl font-black text-sm transition inline-flex items-center gap-2",
                    !canEdit
                      ? "bg-neutral-100 text-neutral-500 border border-neutral-200 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700",
                  )}>
                  {loadingDelivered ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      {t.updating}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {t.markDelivered}
                    </>
                  )}
                </button>

                <button
                  disabled={!canEdit || loadingCanceled}
                  onClick={handleUpdateOrderToCanceled}
                  className={clsx(
                    "h-10 px-4 rounded-2xl font-black text-sm transition inline-flex items-center gap-2",
                    !canEdit
                      ? "bg-neutral-100 text-neutral-500 border border-neutral-200 cursor-not-allowed"
                      : "bg-rose-600 text-white hover:bg-rose-700",
                  )}>
                  {loadingCanceled ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      {t.updating}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      {t.markCanceled}
                    </>
                  )}
                </button>

                <PDFDownloadLink
                  document={<Invoise order={order} />}
                  fileName={`invoice-${order?._id}-${order?.createdAt?.substring(0, 10)}.pdf`}>
                  <button className="h-10 px-4 rounded-2xl font-black text-sm transition inline-flex items-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800">
                    <Download className="h-4 w-4" />
                    {t.downloadInvoice}
                  </button>
                </PDFDownloadLink>
              </div>
            </div>

            <Separator className="my-5 bg-black/10" />

            {/* Content grid */}
            {order && (
              <div className="grid gap-5 lg:grid-cols-12">
                {/* Left: details */}
                <div className="lg:col-span-8 space-y-5">
                  {/* Customer */}
                  <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-black text-neutral-950 mb-4">
                      {language === "ar" ? "معلومات العميل" : "Customer"}
                    </h2>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-neutral-500 font-semibold">{t.userName}</p>
                        <p className="font-bold text-neutral-900">{order?.user?.name || "-"}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-neutral-500 font-semibold">{t.userEmail}</p>
                        <p className="font-bold text-neutral-900 break-words">
                          {order?.user?.email || "-"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-neutral-500 font-semibold">{t.userPhone}</p>
                        <p className="font-bold text-neutral-900">{order?.user?.phone || "-"}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-neutral-500 font-semibold">{t.paymentMethod}</p>
                        <p className="font-bold text-neutral-900 inline-flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-neutral-500" />
                          {order?.paymentMethod || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
                      <h2 className="text-base font-black text-neutral-950 inline-flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {t.items} ({order?.orderItems?.length || 0})
                      </h2>
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full min-w-[760px] text-sm text-left">
                        <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                          <tr>
                            <th className="px-5 py-3">{language === "ar" ? "المنتج" : "Item"}</th>
                            <th className="px-5 py-3">{t.variant}</th>
                            <th className="px-5 py-3">{t.quantity}</th>
                            <th className="px-5 py-3">{t.price}</th>
                            <th className="px-5 py-3">{t.totalLine}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          {order?.orderItems?.map((item: any) => (
                            <tr key={item._id} className="hover:bg-neutral-50 transition">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3 max-w-[360px]">
                                  <img
                                    src={item?.variantImage?.[0]?.url || item?.image?.[0]?.url}
                                    className="w-14 h-14 object-cover rounded-2xl border bg-neutral-50"
                                    alt={item?.name}
                                  />
                                  <div className="min-w-0">
                                    <p className="font-black text-neutral-900 truncate">
                                      {item?.name}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                      {language === "ar" ? "كود المنتج" : "SKU"}: {item?._id}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                {item.variantColor && item.variantSize
                                  ? `${item.variantColor} / ${item.variantSize}`
                                  : "-"}
                              </td>
                              <td className="px-5 py-4 font-bold">{item.qty}</td>
                              <td className="px-5 py-4">{Number(item.price).toFixed(3)} KD</td>
                              <td className="px-5 py-4 font-black text-neutral-900">
                                {(item.qty * item.price).toFixed(3)} KD
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden p-4 space-y-3">
                      {order?.orderItems?.map((item: any, idx: number) => (
                        <div
                          key={`${item._id}-${idx}`}
                          className="rounded-3xl border border-neutral-200 bg-white p-3 flex gap-3">
                          <img
                            src={item?.variantImage?.[0]?.url || item?.image?.[0]?.url}
                            alt={item.name}
                            className="w-28 h-28 object-cover rounded-2xl border bg-neutral-50"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-neutral-900 break-words">{item.name}</p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {t.colorSize}: {item.variantColor ?? "-"} / {item.variantSize ?? "-"}
                            </p>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-2">
                                <p className="text-xs text-neutral-500">{t.price}</p>
                                <p className="font-black">{Number(item.price).toFixed(3)} KD</p>
                              </div>
                              <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-2">
                                <p className="text-xs text-neutral-500">{t.quantity}</p>
                                <p className="font-black">{item.qty}</p>
                              </div>
                            </div>
                            <div className="mt-2 rounded-2xl bg-neutral-900 text-white p-2 flex justify-between">
                              <span className="text-xs font-semibold">{t.totalLine}</span>
                              <span className="font-black">
                                {(item.qty * item.price).toFixed(3)} KD
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: summary + address */}
                <div className="lg:col-span-4 space-y-5">
                  {/* Summary */}
                  <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-black text-neutral-950 mb-4">
                      {language === "ar" ? "ملخص الدفع" : "Payment summary"}
                    </h2>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 font-semibold">
                          {language === "ar" ? "المجموع الفرعي" : "Subtotal"}
                        </span>
                        <span className="font-black text-neutral-900">
                          {subtotal.toFixed(3)} KD
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 font-semibold">{t.delivery}</span>
                        <span className="font-black text-neutral-900">
                          {Number(order?.shippingPrice || 0).toFixed(3)}{" "}
                          {language === "ar" ? "دك" : "KD"}
                        </span>
                      </div>

                      <div className="h-px bg-neutral-200" />

                      <div className="flex items-center justify-between">
                        <span className="text-neutral-900 font-black">{t.total}</span>
                        <span className="font-black text-neutral-900 text-lg">
                          {Number(order?.totalPrice || 0).toFixed(3)}{" "}
                          {language === "ar" ? "دك" : "KD"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600">
                      <Truck className="h-4 w-4" />
                      {language === "ar" ? "شحن داخل الكويت" : "Local shipping (Kuwait)"}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-black text-neutral-950 mb-4 inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t.shippingAddress}
                    </h2>

                    <div className="grid gap-2 text-sm">
                      {[
                        { key: "governorate", label: t.governorate },
                        { key: "city", label: t.city },
                        { key: "block", label: t.block },
                        { key: "street", label: t.street },
                        { key: "house", label: t.house },
                      ].map((f) => (
                        <div
                          key={f.key}
                          className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 flex items-center justify-between gap-3">
                          <span className="text-neutral-500 font-semibold">{f.label}</span>
                          <span className="font-black text-neutral-900 truncate">
                            {order?.shippingAddress?.[f.key] ?? "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-black text-neutral-950 mb-3">{t.orderStatus}</h2>

                    {status === "delivered" ? (
                      <Badge variant="success">
                        {t.delivered} {order?.deliveredAt?.substring(0, 10)}
                      </Badge>
                    ) : status === "canceled" ? (
                      <Badge variant="danger">{t.canceled}</Badge>
                    ) : (
                      <Badge variant="pending">{t.processing}</Badge>
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
