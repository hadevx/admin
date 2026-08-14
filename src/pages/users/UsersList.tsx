import Layout from "../../Layout";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useGetUsersQuery } from "../../redux/queries/userApi";
import { ChevronRight, Crown, Users } from "lucide-react";
import { useSelector } from "react-redux";
import Paginate from "@/components/Paginate";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import EmptyState from "@/components/EmptyState";
import { PageSkeleton } from "@/components/Skeleton";
import clsx from "clsx";

const labels: any = {
  en: {
    users: "Customers",
    subtitle: "Everyone registered on your store",
    totalUsers: " users",
    searchPlaceholder: "Search users by email",
    name: "Name",
    email: "Email",
    phone: "Phone",
    registeredIn: "Registered in",
    admin: "Role",
    user: "User",
    adminRole: "Admin",
    noUsersFound: "No users found.",
    noUsersHint: "Try a different email keyword.",
  },
  ar: {
    users: "العملاء",
    subtitle: "كل المسجلين في متجرك",
    totalUsers: " مستخدمين",
    searchPlaceholder: "ابحث عن المستخدمين بواسطة البريد الإلكتروني",
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    registeredIn: "تاريخ التسجيل",
    admin: "الصلاحية",
    user: "مستخدم",
    adminRole: "مدير",
    noUsersFound: "لم يتم العثور على مستخدمين.",
    noUsersHint: "جرّب كلمة بحث مختلفة.",
  },
};

const getInitials = (name?: string, email?: string) => {
  const safeName = String(name || "").trim();
  if (safeName) {
    const parts = safeName.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase() || safeName.slice(0, 2).toUpperCase();
  }
  const safeEmail = String(email || "").trim();
  return safeEmail ? safeEmail.slice(0, 2).toUpperCase() : "??";
};

const Avatar = ({ user }: { user: any }) => {
  const initials = getInitials(user?.name, user?.email);
  return (
    <div
      className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-[var(--surface-muted)] text-sm font-black text-foreground"
      aria-hidden="true">
      {initials}
    </div>
  );
};

function Customers() {
  const language = useSelector((state: any) => state.language.lang);
  const t = labels[language];
  const isRTL = language === "ar";

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isFetching } = useGetUsersQuery<any>({
    pageNumber: page,
    keyword: searchQuery,
  });

  const users = data?.users || [];
  const pages = data?.pages || 1;
  const totalUsers = data?.total || 0;

  const navigate = useNavigate();

  const filteredUsers = useMemo(
    () =>
      users.filter((user: any) =>
        String(user.email || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [users, searchQuery],
  );

  const RoleTag = ({ isAdmin }: { isAdmin?: boolean }) =>
    isAdmin ? (
      <span className="ws-pill ws-pill-warning">
        <Crown className="size-3.5" />
        {t.adminRole}
      </span>
    ) : (
      <span className="ws-pill ws-pill-neutral">{t.user}</span>
    );

  return (
    <Layout>
      {isLoading ? (
        <PageSkeleton />
      ) : (
        <div className="animate-fade-up">
          <PageHeader
            title={t.users}
            subtitle={t.subtitle}
            icon={Users}
            count={totalUsers > 0 ? totalUsers : 0}
            countLabel={t.totalUsers}
          />

          <div className="mb-4">
            <SearchInput
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                setPage(1);
              }}
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
                      <th>{t.name}</th>
                      <th>{t.email}</th>
                      <th>{t.phone}</th>
                      <th>{t.registeredIn}</th>
                      <th className="text-start">{t.admin}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user: any) => (
                        <tr
                          key={user._id}
                          className="ws-row-link"
                          onClick={() => navigate(`/users/${user._id}`)}>
                          <td>
                            <div className="flex min-w-0 items-center gap-3">
                              <Avatar user={user} />
                              <span className="truncate font-bold">{user?.name || "—"}</span>
                            </div>
                          </td>
                          <td className="text-muted-foreground">{user.email}</td>
                          <td className="text-muted-foreground">{user.phone || "—"}</td>
                          <td className="whitespace-nowrap text-muted-foreground">
                            {user.createdAt?.substring(0, 10)}
                          </td>
                          <td className="text-start">
                            <RoleTag isAdmin={user.isAdmin} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <EmptyState
                            title={t.noUsersFound}
                            description={t.noUsersHint}
                            icon={Users}
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
              {filteredUsers.length > 0 ? (
                <div className="space-y-3">
                  {filteredUsers.map((user: any) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => navigate(`/users/${user._id}`)}
                      className="ws-card w-full p-4 text-start transition active:scale-[0.99]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <Avatar user={user} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold">{user?.name || "—"}</p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {user?.email || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <RoleTag isAdmin={user?.isAdmin} />
                          <ChevronRight
                            className={clsx("size-4 text-muted-foreground", isRTL && "rotate-180")}
                          />
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="ws-tile p-2.5">
                          <p className="text-[11px] text-muted-foreground">{t.phone}</p>
                          <p className="truncate font-bold">{user?.phone || "—"}</p>
                        </div>
                        <div className="ws-tile p-2.5">
                          <p className="text-[11px] text-muted-foreground">{t.registeredIn}</p>
                          <p className="font-bold">{user?.createdAt?.substring(0, 10) || "—"}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="ws-card">
                  <EmptyState title={t.noUsersFound} description={t.noUsersHint} icon={Users} />
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

export default Customers;
