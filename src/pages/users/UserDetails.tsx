import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import clsx from "clsx";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import {
  Loader2Icon,
  Phone,
  ShieldCheck,
  ShieldX,
  MapPin,
  Trash2,
  ExternalLink,
  Clock,
  Laptop,
  XCircle,
  CheckCircle2,
  Hourglass,
  Ban,
  UserCheck,
  Mail,
  Crown,
} from "lucide-react";
import {
  useGetAddressQuery,
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  useGetUsersQuery,
  useToggleBlockUserMutation,
  useToggleVIPUserMutation,
} from "../../redux/queries/userApi";
import { useGetUserOrdersQuery } from "../../redux/queries/orderApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "../../components/ui/separator";
import { useSelector } from "react-redux";

function UserDetails() {
  const { userID } = useParams();
  const navigate = useNavigate();
  const language = useSelector((state: any) => state.language.lang); // 'ar' | 'en'
  const isRTL = language === "ar";

  const { data: userOrders } = useGetUserOrdersQuery(userID);
  const {
    data: user,
    isLoading: loadingUser,
    refetch: refetchUser,
  } = useGetUserDetailsQuery<any>(userID);
  const { data: userAddress, isLoading: loadingAddress } = useGetAddressQuery<any>(userID);

  const [deleteUser, { isLoading: loadingDeleteUser }] = useDeleteUserMutation();
  const [toggleBlockUser, { isLoading: loadingToggleBlock }] = useToggleBlockUserMutation();
  const [toggleVIPUser, { isLoading: loadingToggleVIP }] = useToggleVIPUserMutation();

  const { refetch: refetchUsers } = useGetUsersQuery(undefined);

  const [isModalOpen, setIsModalOpen] = useState(false); // delete modal
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false); // block/unblock modal
  const [isVipModalOpen, setIsVipModalOpen] = useState(false); // vip toggle modal
  const [showMap, setShowMap] = useState(false);

  const t = useMemo(() => {
    const ar = language === "ar";
    return {
      dir: ar ? "rtl" : "ltr",
      pageTitle: ar ? "تفاصيل العميل" : "Customer Details",
      back: ar ? "رجوع" : "Back",
      deleteUser: ar ? "حذف المستخدم" : "Delete user",
      cannotDeleteAdmin: ar ? "لا يمكن حذف مستخدم مسؤول" : "Cannot delete an admin user.",
      deletedOk: ar ? "تم حذف المستخدم بنجاح" : "User deleted successfully",
      deleteErr: ar ? "حدث خطأ أثناء حذف المستخدم" : "An error occurred while deleting the user.",
      confirmTitle: ar ? "حذف المستخدم" : "Delete User",
      confirmBody: ar
        ? "هل أنت متأكد أنك تريد حذف هذا المستخدم؟"
        : "Are you sure you want to delete this user?",
      cancel: ar ? "إلغاء" : "Cancel",
      confirmDelete: ar ? "حذف" : "Delete",

      // block/unblock
      blockUser: ar ? "حظر المستخدم" : "Block user",
      unblockUser: ar ? "إلغاء الحظر" : "Unblock user",
      blockTitle: ar ? "تغيير حالة الحظر" : "Change block status",
      blockBodyBlock: ar
        ? "هل أنت متأكد أنك تريد حظر هذا المستخدم؟"
        : "Are you sure you want to block this user?",
      blockBodyUnblock: ar
        ? "هل أنت متأكد أنك تريد إلغاء حظر هذا المستخدم؟"
        : "Are you sure you want to unblock this user?",
      blockedOk: ar ? "تم حظر المستخدم" : "User blocked",
      unblockedOk: ar ? "تم إلغاء حظر المستخدم" : "User unblocked",
      blockErr: ar ? "فشل تحديث حالة الحظر" : "Failed to update block status",
      blockedBadge: ar ? "محظور" : "Blocked",

      // VIP
      vip: ar ? "VIP" : "VIP",
      vipUser: ar ? "تعيين VIP" : "Make VIP",
      unvipUser: ar ? "إلغاء VIP" : "Remove VIP",
      vipTitle: ar ? "تغيير حالة VIP" : "Change VIP status",
      vipBodyMake: ar ? "هل تريد تعيين هذا المستخدم كـ VIP؟" : "Make this user a VIP?",
      vipBodyRemove: ar ? "هل تريد إزالة VIP من هذا المستخدم؟" : "Remove VIP from this user?",
      vipOk: ar ? "تم تعيين المستخدم كـ VIP" : "User marked as VIP",
      unvipOk: ar ? "تم إزالة VIP" : "VIP removed",
      vipErr: ar ? "فشل تحديث حالة VIP" : "Failed to update VIP status",

      // sections
      address: ar ? "العنوان" : "Address",
      orders: ar ? "الطلبات" : "Orders",
      map: ar ? "الخريطة" : "Map",
      showMap: ar ? "عرض الخريطة" : "Show map",
      hideMap: ar ? "إخفاء الخريطة" : "Hide map",
      openInMaps: ar ? "فتح في خرائط Google" : "Open in Google Maps",
      mapHint: ar
        ? "قد تكون الخريطة تقريبية حسب تفاصيل العنوان."
        : "Map may be approximate depending on address details.",

      // profile fields
      admin: ar ? "مسؤول" : "Admin",
      isAdmin: ar ? "مسؤول" : "Admin",
      notAdmin: ar ? "غير مسؤول" : "Not admin",
      lastLogin: ar ? "آخر تسجيل دخول" : "Last login",
      device: ar ? "الجهاز" : "Device",
      email: ar ? "البريد الإلكتروني" : "Email",
      phone: ar ? "الهاتف" : "Phone",

      noAddress: ar ? "المستخدم لم يقدم عنواناً بعد" : "User has not added an address yet.",
      noOrders: ar ? "المستخدم ليس لديه طلبات" : "This user has no orders yet.",

      governorate: ar ? "المحافظة" : "Governorate",
      city: ar ? "المدينة" : "City",
      block: ar ? "المنطقة" : "Block",
      street: ar ? "الشارع" : "Street",
      house: ar ? "البيت" : "House",

      payment: ar ? "طريقة الدفع" : "Payment",
      total: ar ? "الإجمالي" : "Total",
      products: ar ? "المنتجات" : "Items",
      status: ar ? "الحالة" : "Status",

      delivered: ar ? "تم التوصيل" : "Delivered",
      processing: ar ? "قيد المعالجة" : "Processing",
      canceled: ar ? "ملغي" : "Canceled",
    };
  }, [language]);

  const handleDeleteUser = async () => {
    try {
      if (user?.isAdmin) {
        toast.error(t.cannotDeleteAdmin);
        return;
      }

      await deleteUser(userID).unwrap();
      toast.success(t.deletedOk);
      refetchUsers();
      navigate("/users");
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || t.deleteErr;
      toast.error(errorMsg);
    }
  };

  const handleToggleBlock = async () => {
    try {
      if (!userID) return;

      if (user?.isAdmin) {
        toast.error(t.cannotDeleteAdmin);
        return;
      }

      const res: any = await toggleBlockUser({ userId: userID }).unwrap();

      const nextBlocked =
        typeof res?.isBlocked === "boolean"
          ? res.isBlocked
          : typeof res?.user?.isBlocked === "boolean"
            ? res.user.isBlocked
            : !user?.isBlocked;

      toast.success(nextBlocked ? t.blockedOk : t.unblockedOk);

      setIsBlockModalOpen(false);
      refetchUser();
      refetchUsers();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || t.blockErr, { position: "top-center" });
    }
  };

  const handleToggleVIP = async () => {
    try {
      if (!userID) return;

      if (user?.isAdmin) {
        toast.error(t.cannotDeleteAdmin);
        return;
      }

      const res: any = await toggleVIPUser({ userId: userID }).unwrap();

      const nextVIP =
        typeof res?.isVIP === "boolean"
          ? res.isVIP
          : typeof res?.user?.isVIP === "boolean"
            ? res.user.isVIP
            : !user?.isVIP;

      toast.success(nextVIP ? t.vipOk : t.unvipOk);

      setIsVipModalOpen(false);
      refetchUser();
      refetchUsers();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || t.vipErr, { position: "top-center" });
    }
  };

  const loading = loadingUser || loadingAddress;

  // Last login
  const lastLoginRaw =
    user?.lastLoginAt ?? user?.lastLogin ?? user?.lastSeenAt ?? user?.lastActiveAt ?? null;

  const lastLoginText = useMemo(() => {
    if (!lastLoginRaw) return "—";
    const d = new Date(lastLoginRaw);
    if (Number.isNaN(d.getTime())) return String(lastLoginRaw);
    return d.toLocaleString(isRTL ? "ar" : "en", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [lastLoginRaw, isRTL]);

  // Device
  const deviceText = useMemo(() => {
    const platform = user?.deviceInfo?.platform;
    if (platform) return String(platform);

    const ua = user?.deviceInfo?.userAgent ?? user?.userAgent ?? null;
    if (!ua) return "—";

    const s = String(ua);
    if (/iphone/i.test(s)) return "iPhone";
    if (/ipad/i.test(s)) return "iPad";
    if (/android/i.test(s)) return "Android";
    if (/macintosh|mac os/i.test(s)) return "Mac";
    if (/windows/i.test(s)) return "Windows";
    if (/linux/i.test(s)) return "Linux";
    return isRTL ? "متصفح" : "Browser";
  }, [user, isRTL]);

  // Address -> map
  const addressText = useMemo(() => {
    if (!userAddress) return "";
    const parts = [
      userAddress?.house ? `House ${userAddress.house}` : "",
      userAddress?.street ? `Street ${userAddress.street}` : "",
      userAddress?.block ? `Block ${userAddress.block}` : "",
      userAddress?.city || "",
      userAddress?.governorate || "",
      "Kuwait",
    ].filter(Boolean);

    return parts.join(", ");
  }, [userAddress]);

  const mapsQuery = useMemo(() => encodeURIComponent(addressText), [addressText]);

  const mapsEmbedSrc = useMemo(() => {
    if (!mapsQuery) return "";
    return `https://www.google.com/maps?q=${mapsQuery}&output=embed`;
  }, [mapsQuery]);

  const mapsOpenUrl = useMemo(() => {
    if (!mapsQuery) return "";
    return `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  }, [mapsQuery]);

  const hasAddress = !!addressText;

  // Order status detection
  const getOrderStatus = (order: any) => {
    const statusStr = String(order?.status || order?.orderStatus || "").toLowerCase();

    const isCanceled =
      order?.isCanceled === true ||
      order?.canceled === true ||
      order?.cancelled === true ||
      statusStr === "canceled" ||
      statusStr === "cancelled";

    if (isCanceled) return "canceled";
    if (order?.isDelivered) return "delivered";
    return "processing";
  };

  const StatusBadge = ({ order }: { order: any }) => {
    const s = getOrderStatus(order);
    if (s === "canceled") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          <XCircle className="h-4 w-4" />
          {t.canceled}
        </span>
      );
    }
    if (s === "delivered") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          {t.delivered}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        <Hourglass className="h-4 w-4" />
        {t.processing}
      </span>
    );
  };

  const statusTextForCell = (order: any) => {
    const s = getOrderStatus(order);
    return s === "canceled" ? t.canceled : s === "delivered" ? t.delivered : t.processing;
  };

  const InfoTile = ({
    icon,
    label,
    value,
    valueClassName,
    tileClassName,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: any;
    valueClassName?: string;
    tileClassName?: string;
  }) => (
    <div
      className={clsx(
        "rounded-2xl border p-4",
        "border-black/10 bg-zinc-50",
        "dark:border-white/10 dark:bg-white/5",
        tileClassName,
      )}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-zinc-500 dark:text-zinc-400">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</p>
          <p
            className={clsx(
              "mt-1 text-sm font-bold break-words",
              value ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500",
              valueClassName,
            )}>
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );

  const initials = useMemo(() => {
    const name = String(user?.name || "").trim();
    const first = (name.charAt(0) || "W").toUpperCase();
    const last = (name.charAt(name.length - 1) || "S").toUpperCase();
    return `${first}${last}`;
  }, [user?.name]);

  // VIP styling (tile)
  const vipTileStyle = user?.isVIP
    ? "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30"
    : "";
  const vipValueStyle = user?.isVIP ? "text-amber-800 dark:text-amber-200" : "text-zinc-400";

  const BlockedBadge = () =>
    user?.isBlocked ? (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-extrabold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
        <Ban className="h-3.5 w-3.5" />
        {t.blockedBadge}
      </span>
    ) : null;

  return (
    <Layout>
      {loading ? (
        <Loader />
      ) : (
        <div
          dir={t.dir}
          className={clsx(
            "w-full lg:max-w-4xl min-h-screen px-4 pb-10 mt-[70px] lg:mt-[50px]",
            "text-zinc-900 dark:text-white",
          )}>
          {/* Top bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">{t.pageTitle}</h1>
            </div>

            <div className="flex items-center gap-2">
              {/* VIP Toggle */}
              {!user?.isAdmin && (
                <Button
                  disabled={loadingToggleVIP}
                  onClick={() => setIsVipModalOpen(true)}
                  variant="outline"
                  className={clsx(
                    "border-black/10 dark:border-white/10 dark:bg-transparent",
                    user?.isVIP
                      ? "text-amber-700 hover:text-amber-800 dark:text-amber-200 dark:hover:text-amber-100"
                      : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white",
                  )}>
                  {loadingToggleVIP ? (
                    <Loader2Icon className="h-4 w-4 animate-spin me-2" />
                  ) : (
                    <Crown className="h-4 w-4 me-2" />
                  )}
                  {user?.isVIP ? t.unvipUser : t.vipUser}
                </Button>
              )}

              {/* Block/Unblock */}
              {!user?.isAdmin && (
                <Button
                  disabled={loadingToggleBlock}
                  onClick={() => setIsBlockModalOpen(true)}
                  variant="outline"
                  className={clsx(
                    "border-black/10 dark:border-white/10 dark:bg-transparent",
                    user?.isBlocked
                      ? "text-emerald-700 hover:text-emerald-800 dark:text-emerald-200 dark:hover:text-emerald-100"
                      : "text-rose-700 hover:text-rose-800 dark:text-rose-200 dark:hover:text-rose-100",
                  )}>
                  {loadingToggleBlock ? (
                    <Loader2Icon className="h-4 w-4 animate-spin me-2" />
                  ) : user?.isBlocked ? (
                    <UserCheck className="h-4 w-4 me-2" />
                  ) : (
                    <Ban className="h-4 w-4 me-2" />
                  )}
                  {user?.isBlocked ? t.unblockUser : t.blockUser}
                </Button>
              )}

              {!user?.isAdmin && (
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-t from-rose-500 to-rose-400 hover:opacity-90 dark:from-rose-600 dark:to-rose-500">
                  <Trash2 className="h-4 w-4 me-2" />
                  {t.deleteUser}
                </Button>
              )}
            </div>
          </div>

          <Separator className="my-5 bg-black/10 dark:bg-white/10" />

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <div className="lg:col-span-1 space-y-4">
              {/* Profile card */}
              <div className="rounded-2xl border bg-white p-5 shadow-sm border-black/10 dark:bg-zinc-950 dark:border-white/10">
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-zinc-900 text-white grid place-items-center font-bold dark:bg-white dark:text-zinc-900">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                            {user?.name || "—"}
                          </h2>

                          {/* ✅ Blocked badge next to name */}
                          <BlockedBadge />

                          {/* optional VIP mini badge next to name (nice touch) */}
                          {user?.isVIP ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                              <Crown className="h-3.5 w-3.5" />
                              VIP
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 truncate">
                          {user?.email || "—"}
                        </p>
                      </div>
                    </div>

                    {/* USER INFO BOXES */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <InfoTile
                        icon={<Mail className="h-4 w-4" />}
                        label={t.email}
                        value={user?.email}
                      />
                      <InfoTile
                        icon={<Phone className="h-4 w-4" />}
                        label={t.phone}
                        value={user?.phone}
                      />

                      <InfoTile
                        icon={
                          user?.isAdmin ? (
                            <ShieldCheck className="h-4 w-4" />
                          ) : (
                            <ShieldX className="h-4 w-4" />
                          )
                        }
                        label={t.admin}
                        value={user?.isAdmin ? t.isAdmin : t.notAdmin}
                      />

                      {/* VIP tile stays */}
                      <InfoTile
                        icon={
                          <Crown
                            className={clsx(
                              "h-4 w-4",
                              user?.isVIP
                                ? "text-amber-600 dark:text-amber-300"
                                : "text-zinc-400 dark:text-zinc-500",
                            )}
                          />
                        }
                        label={t.vip}
                        value={user?.isVIP ? "VIP" : "—"}
                        tileClassName={vipTileStyle}
                        valueClassName={vipValueStyle}
                      />

                      <InfoTile
                        icon={<Clock className="h-4 w-4" />}
                        label={t.lastLogin}
                        value={lastLoginText}
                      />
                      <InfoTile
                        icon={<Laptop className="h-4 w-4" />}
                        label={t.device}
                        value={deviceText}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address card */}
              <div className="rounded-2xl border bg-white p-5 shadow-sm border-black/10 dark:bg-zinc-950 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">{t.address}</h2>
                  <MapPin className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                </div>

                <Separator className="my-4 bg-black/10 dark:bg-white/10" />

                {userAddress ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <InfoRow label={t.governorate} value={userAddress?.governorate} />
                      <InfoRow label={t.city} value={userAddress?.city} />
                      <InfoRow label={t.block} value={userAddress?.block} />
                      <InfoRow label={t.street} value={userAddress?.street} />
                      <InfoRow label={t.house} value={userAddress?.house} />
                    </div>

                    {hasAddress ? (
                      <div className="mt-5">
                        <div className="flex flex-wrap items-center gap-2 justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-zinc-900 dark:text-white">
                              {t.map}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {t.mapHint}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowMap((v) => !v)}
                              className="border-black/10 dark:border-white/10 dark:bg-transparent">
                              <MapPin className="h-4 w-4 me-2" />
                              {showMap ? t.hideMap : t.showMap}
                            </Button>

                            <a
                              href={mapsOpenUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200">
                              <ExternalLink className="h-4 w-4" />
                              {t.openInMaps}
                            </a>
                          </div>
                        </div>

                        {showMap ? (
                          <>
                            <div className="mt-3 overflow-hidden rounded-2xl border border-black/10 bg-zinc-50 dark:border-white/10 dark:bg-white/5">
                              <iframe
                                title="user-location-map"
                                src={mapsEmbedSrc}
                                className="h-[260px] w-full"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                              />
                            </div>

                            <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 break-words">
                              <span className="font-semibold">
                                {isRTL ? "العنوان:" : "Address:"}
                              </span>{" "}
                              {addressText}
                            </p>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.noAddress}</p>
                )}
              </div>
            </div>

            {/* Orders */}
            <div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm border-black/10 dark:bg-zinc-950 dark:border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                    {t.orders}
                    <span className="ms-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                      {userOrders?.length ? `(${userOrders.length})` : ""}
                    </span>
                  </h2>
                </div>

                <Separator className="my-4 bg-black/10 dark:bg-white/10" />

                {userOrders?.length > 0 ? (
                  <div className="space-y-4">
                    {userOrders.map((order: any) => (
                      <Link
                        key={order._id}
                        to={`/orders/${order._id}`}
                        className="group block rounded-2xl border border-black/10 bg-white p-5 hover:bg-zinc-50 hover:border-black/20 hover:shadow-sm transition-all dark:bg-zinc-950 dark:border-white/10 dark:hover:bg-white/5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-zinc-900 dark:text-white">
                              #{String(order._id || "").slice(-6)}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                              {order?.createdAt ? order.createdAt.substring(0, 10) : "—"}
                            </p>
                          </div>

                          <StatusBadge order={order} />
                        </div>

                        <Separator className="my-4 bg-black/10 dark:bg-white/10" />

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <OrderInfo label={t.payment} value={order?.paymentMethod || "—"} />
                          <OrderInfo
                            label={t.products}
                            value={`${order?.orderItems?.length ?? 0}`}
                          />
                          <OrderInfo
                            label={t.total}
                            value={
                              typeof order?.totalPrice === "number"
                                ? `${order.totalPrice.toFixed(3)} KD`
                                : "—"
                            }
                            highlight
                          />
                          <OrderInfo label={t.status} value={statusTextForCell(order)} />
                        </div>

                        <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400 opacity-0 group-hover:opacity-100 transition">
                          {isRTL ? "عرض تفاصيل الطلب ←" : "View order details →"}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-black/10 p-8 text-center dark:border-white/10">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.noOrders}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIP Modal */}
      <Dialog open={isVipModalOpen} onOpenChange={setIsVipModalOpen}>
        <DialogContent className="rounded-2xl border border-black/10 bg-white dark:bg-zinc-950 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
              <span className="h-9 w-9 rounded-xl bg-amber-100 border border-amber-200 grid place-items-center dark:bg-amber-500/10 dark:border-amber-500/30">
                <Crown className="h-4 w-4 text-amber-700 dark:text-amber-200" />
              </span>
              {t.vipTitle}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {user?.isVIP ? t.vipBodyRemove : t.vipBodyMake}
          </p>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsVipModalOpen(false)}
              className="border-black/10 dark:border-white/10 dark:bg-transparent">
              {t.cancel}
            </Button>

            <Button
              disabled={loadingToggleVIP}
              onClick={handleToggleVIP}
              className={clsx(
                user?.isVIP
                  ? "bg-gradient-to-t from-zinc-800 to-zinc-700 hover:opacity-90"
                  : "bg-gradient-to-t from-amber-600 to-amber-500 hover:opacity-90",
              )}>
              {loadingToggleVIP ? <Loader2Icon className="h-4 w-4 animate-spin" /> : null}
              <span className={clsx(!loadingToggleVIP && "ms-1")}>
                {user?.isVIP ? t.unvipUser : t.vipUser}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Modal */}
      <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
        <DialogContent className="rounded-2xl border border-black/10 bg-white dark:bg-zinc-950 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
              <span
                className={clsx(
                  "h-9 w-9 rounded-xl border grid place-items-center",
                  user?.isBlocked
                    ? "bg-emerald-100 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30"
                    : "bg-rose-100 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30",
                )}>
                {user?.isBlocked ? (
                  <UserCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-200" />
                ) : (
                  <Ban className="h-4 w-4 text-rose-700 dark:text-rose-200" />
                )}
              </span>
              {t.blockTitle}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {user?.isBlocked ? t.blockBodyUnblock : t.blockBodyBlock}
          </p>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBlockModalOpen(false)}
              className="border-black/10 dark:border-white/10 dark:bg-transparent">
              {t.cancel}
            </Button>

            <Button
              disabled={loadingToggleBlock}
              onClick={handleToggleBlock}
              className={clsx(
                user?.isBlocked
                  ? "bg-gradient-to-t from-emerald-600 to-emerald-500 hover:opacity-90"
                  : "bg-gradient-to-t from-rose-600 to-rose-500 hover:opacity-90",
              )}>
              {loadingToggleBlock ? <Loader2Icon className="h-4 w-4 animate-spin" /> : null}
              <span className={clsx(!loadingToggleBlock && "ms-1")}>
                {user?.isBlocked ? t.unblockUser : t.blockUser}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-2xl border border-black/10 bg-white dark:bg-zinc-950 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
              <span className="h-9 w-9 rounded-xl bg-rose-100 border border-rose-200 grid place-items-center dark:bg-rose-500/10 dark:border-rose-500/30">
                <Trash2 className="h-4 w-4 text-rose-700 dark:text-rose-200" />
              </span>
              {t.confirmTitle}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-zinc-600 dark:text-zinc-300">{t.confirmBody}</p>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-black/10 dark:border-white/10 dark:bg-transparent">
              {t.cancel}
            </Button>
            <Button
              disabled={loadingDeleteUser}
              variant="destructive"
              className="bg-gradient-to-t from-rose-500 to-rose-400 hover:opacity-90 dark:from-rose-600 dark:to-rose-500"
              onClick={handleDeleteUser}>
              {loadingDeleteUser ? <Loader2Icon className="h-4 w-4 animate-spin" /> : null}
              <span className={clsx(!loadingDeleteUser && "ms-1")}>{t.confirmDelete}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function InfoRow({ label, value }: { label: string; value?: any }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      <span
        className={clsx(
          "mt-1 font-semibold",
          value ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400 dark:text-zinc-500",
        )}>
        {value || "—"}
      </span>
    </div>
  );
}

function OrderInfo({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      <span
        className={clsx(
          highlight
            ? "text-zinc-900 text-base dark:text-white"
            : "text-zinc-800 dark:text-zinc-200",
          "font-semibold",
        )}>
        {value}
      </span>
    </div>
  );
}

export default UserDetails;
