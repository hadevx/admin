import Layout from "../../Layout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGetOrdersQuery } from "../../redux/queries/orderApi";
import { ChevronRight, Package, ShoppingBasket, Wallet } from "lucide-react";
import { useSelector } from "react-redux";
import { texts } from "./translations";
import Paginate from "@/components/Paginate";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import EmptyState from "@/components/EmptyState";
import StatCard from "@/components/StatCard";
import { PageSkeleton } from "@/components/Skeleton";
import clsx from "clsx";

function Order() {
  const navigate = useNavigate();
  const language = useSelector((state: any) => state.language.lang);
  const isRTL = language === "ar";
  const t = texts[language];

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data, isLoading, isFetching } = useGetOrdersQuery({
    pageNumber: page,
    keyword: searchQuery,
  });

  const orders = data?.orders || [];
  const pages = data?.pages || 1;

  const filteredOrders = orders.filter((order: any) => {
    const query = searchQuery.toLowerCase();
    return (
      order._id?.toLowerCase().includes(query) ||
      order.user?.name?.toLowerCase().includes(query) ||
      order.paymentMethod?.toLowerCase().includes(query)
    );
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const StatusBadge = ({ order }: { order: any }) => {
    if (order?.isDelivered)
      return <span className="ws-pill ws-pill-success">{t.delivered}</span>;
    if (order?.isCanceled) return <span className="ws-pill ws-pill-danger">{t.canceled}</span>;
    return <span className="ws-pill ws-pill-warning">{t.processing}</span>;
  };

  const currency = isRTL ? "دك" : "KD";

  return (
    <Layout>
      {isLoading ? (
        <PageSkeleton />
      ) : (
        <div className="animate-fade-up">
          <PageHeader
            title={t.orders}
            subtitle={isRTL ? "تابع وأدر كل الطلبات" : "Track and manage every order"}
            icon={ShoppingBasket}
            count={data?.total > 0 ? data.total : 0}
            countLabel={` ${t.orders}`}
          />

          {/* Snapshot */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label={t.revenue}
              value={`${data?.totalRevenue ?? 0} ${currency}`}
              icon={Wallet}
            />
            <StatCard
              label={t.itemsSold}
              value={data?.totalItems ?? 0}
              icon={Package}
            />
            <StatCard
              label={t.orders}
              value={data?.total ?? 0}
              icon={ShoppingBasket}
            />
          </div>

          {/* Search */}
          <div className="mb-4">
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t.searchPlaceholder}
            />
          </div>

          <div className={clsx("transition-opacity duration-200", isFetching && "opacity-60")}>
            {/* Desktop table */}
            <div className="hidden lg:block">
              <div className="ws-table-wrap">
                <table className="ws-table">
                  <thead>
                    <tr>
                      <th>{t.customer}</th>
                      <th>{t.payment}</th>
                      <th>{t.items}</th>
                      <th>{t.createdAt}</th>
                      <th>{t.status}</th>
                      <th className="text-start">{t.total}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.length ? (
                      filteredOrders.map((order: any) => (
                        <tr
                          key={order?._id}
                          className="ws-row-link"
                          onClick={() => navigate(`/orders/${order?._id}`)}>
                          <td className="font-bold">{order?.user?.name || "—"}</td>
                          <td className="whitespace-nowrap capitalize">
                            {order?.paymentMethod || "—"}
                          </td>
                          <td>
                            <span className="ws-pill ws-pill-neutral">
                              {order?.orderItems?.length ?? 0}
                            </span>
                          </td>
                          <td className="whitespace-nowrap text-muted-foreground">
                            {order?.createdAt?.substring(0, 10)}
                          </td>
                          <td>
                            <StatusBadge order={order} />
                          </td>
                          <td className="whitespace-nowrap text-start font-extrabold">
                            {order?.totalPrice?.toFixed(3)} {currency}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <EmptyState
                            title={t.noOrders}
                            description={
                              isRTL
                                ? "جرّب تعديل كلمات البحث."
                                : "Try adjusting your search keywords."
                            }
                            icon={ShoppingBasket}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Paginate page={page} pages={pages} setPage={setPage} />
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden">
              {filteredOrders.length ? (
                <div className="space-y-3">
                  {filteredOrders.map((order: any) => (
                    <button
                      key={order?._id}
                      type="button"
                      onClick={() => navigate(`/orders/${order?._id}`)}
                      className="ws-card w-full p-4 text-start transition active:scale-[0.99]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {/* Order id dropped here too, to match the table */}
                          <p className="truncate text-sm font-extrabold">
                            {order?.user?.name || t.customer}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <StatusBadge order={order} />
                          <ChevronRight
                            className={clsx(
                              "size-4 text-muted-foreground",
                              isRTL && "rotate-180",
                            )}
                          />
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        {[
                          { label: t.payment, value: order?.paymentMethod || "—" },
                          { label: t.items, value: order?.orderItems?.length ?? 0 },
                          { label: t.createdAt, value: order?.createdAt?.substring(0, 10) || "—" },
                          {
                            label: t.total,
                            value: `${order?.totalPrice?.toFixed(3)} ${currency}`,
                          },
                        ].map((cell) => (
                          <div key={cell.label} className="ws-tile p-2.5">
                            <p className="text-[11px] text-muted-foreground">{cell.label}</p>
                            <p className="truncate font-bold">{cell.value}</p>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="ws-card">
                  <EmptyState
                    title={t.noOrders}
                    description={
                      isRTL ? "جرّب تعديل كلمات البحث." : "Try adjusting your search keywords."
                    }
                    icon={ShoppingBasket}
                  />
                </div>
              )}

              <Paginate page={page} pages={pages} setPage={setPage} />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Order;
