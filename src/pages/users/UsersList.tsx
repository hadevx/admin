import Layout from "../../Layout";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useGetUsersQuery } from "../../redux/queries/userApi";
import { Search, Crown, Users } from "lucide-react";
import Badge from "../../components/Badge";
import { Separator } from "../../components/ui/separator";
import Loader from "../../components/Loader";
import { useSelector } from "react-redux";
import Paginate from "@/components/Paginate";
import clsx from "clsx";

function Customers() {
  const language = useSelector((state: any) => state.language.lang);

  const labels: any = {
    en: {
      users: "Users",
      totalUsers: "users",
      searchPlaceholder: "Search users by email",
      name: "Name",
      email: "Email",
      phone: "Phone",
      registeredIn: "Registered in",
      admin: "Admin",
      user: "User",
      noUsersFound: "No users found.",
    },
    ar: {
      users: "المستخدمون",
      totalUsers: "مستخدمين",
      searchPlaceholder: "ابحث عن المستخدمين بواسطة البريد الإلكتروني",
      name: "الاسم",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      registeredIn: "تاريخ التسجيل",
      admin: "مدير",
      user: "مستخدم",
      noUsersFound: "لم يتم العثور على مستخدمين.",
    },
  };

  const t = labels[language];
  const isRTL = language === "ar";

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const { data, isLoading } = useGetUsersQuery<any>({
    pageNumber: page,
    keyword: searchQuery,
  });

  const users = data?.users || [];
  const pages = data?.pages || 1;
  const totalUsers = data?.total || 0;

  const navigate = useNavigate();
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      const filtered = users.filter((user: any) =>
        String(user.email || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      );
      setFilteredUsers(filtered);
    }
  }, [data, searchQuery, users]);

  // ✅ initials avatar helpers
  const getInitials = (name?: string, email?: string) => {
    const safeName = String(name || "").trim();
    if (safeName) {
      const parts = safeName.split(/\s+/).filter(Boolean);
      const first = parts[0]?.[0] || "";
      const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
      const two = (first + last).toUpperCase();
      return two || safeName.slice(0, 2).toUpperCase();
    }
    const safeEmail = String(email || "").trim();
    if (safeEmail) return safeEmail.slice(0, 2).toUpperCase();
    return "??";
  };

  const Avatar = ({ user }: { user: any }) => {
    const initials = getInitials(user?.name, user?.email);
    return (
      <div
        className={clsx(
          "shrink-0 h-10 w-10 rounded-md border",
          "grid place-items-center font-black text-sm",
          // ✅ light
          "bg-neutral-950 text-white border-black/10",
          // ✅ dark
          "dark:bg-white dark:text-neutral-900 dark:border-white/10",
        )}
        aria-label="avatar">
        {initials}
      </div>
    );
  };

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="lg:px-4 mb-10 lg:w-4xl w-full min-h-screen lg:min-h-auto flex text-xs lg:text-lg justify-between py-3 mt-[70px] lg:mt-[50px] px-4">
          <div className="w-full">
            {/* Header */}
            <div className={isRTL ? "flex justify-end" : "flex justify-between"}>
              <h1
                dir={isRTL ? "rtl" : "ltr"}
                className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-5 items-center flex-wrap text-neutral-900 dark:text-white">
                {t.users}:{" "}
                <Badge icon={false}>
                  <Users strokeWidth={1} />
                  <p className="text-lg lg:text-sm">
                    {totalUsers > 0 ? totalUsers : "0"}{" "}
                    <span className="hidden lg:inline">{t.totalUsers}</span>
                  </p>
                </Badge>
              </h1>
            </div>

            <Separator className="my-4 bg-black/20 dark:bg-white/10" />

            <div className="mt-5 mb-2 overflow-hidden">
              {/* ✅ Search (FULL WIDTH) */}
              <div className="relative w-full mb-5">
                <span
                  className={clsx(
                    "absolute inset-y-0 flex items-center text-gray-400 dark:text-zinc-400",
                    isRTL ? "right-0 pr-3" : "left-0 pl-3",
                  )}>
                  <Search className="h-5 w-5" />
                </span>

                <input
                  dir={isRTL ? "rtl" : "ltr"}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder={t.searchPlaceholder}
                  className={clsx(
                    "w-full border rounded-lg py-3 text-sm",
                    "focus:outline-none focus:border-blue-500 focus:border-2",
                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
                    // ✅ light
                    "bg-white border-gray-300 text-neutral-900 placeholder:text-gray-400",
                    // ✅ dark
                    "dark:bg-zinc-900 dark:border-white/10 dark:text-white dark:placeholder:text-zinc-400 dark:focus:border-blue-400",
                  )}
                />
              </div>

              {/* ✅ Desktop table */}
              <div className="hidden lg:block rounded-lg border lg:p-5 overflow-x-scroll md:overflow-auto bg-white dark:bg-zinc-950 dark:border-white/10">
                <table className="w-full rounded-lg text-xs lg:text-sm border-gray-200 text-left text-gray-700 dark:text-zinc-200">
                  <thead className="bg-white dark:bg-zinc-950 text-gray-900/50 dark:text-zinc-400 font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b border-black/10 dark:border-white/10">
                        {t.name}
                      </th>
                      <th className="px-4 py-3 border-b border-black/10 dark:border-white/10">
                        {t.email}
                      </th>
                      <th className="px-4 py-3 border-b border-black/10 dark:border-white/10">
                        {t.phone}
                      </th>
                      <th className="px-4 py-3 border-b border-black/10 dark:border-white/10">
                        {t.registeredIn}
                      </th>
                      <th className="px-4 py-3 border-b border-black/10 dark:border-white/10">
                        {t.admin}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 dark:divide-white/10 bg-white dark:bg-zinc-950">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user: any) => (
                        <tr
                          key={user._id}
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300 font-bold"
                          onClick={() => navigate(`/users/${user._id}`)}>
                          {/* ✅ Name cell now includes avatar */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar user={user} />
                              <span className="truncate text-neutral-900 dark:text-white">
                                {user?.name || "-"}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-5 text-neutral-900 dark:text-zinc-200">
                            {user.email}
                          </td>
                          <td className="px-4 py-5 text-neutral-900 dark:text-zinc-200">
                            {user.phone}
                          </td>
                          <td className="px-4 py-5 text-neutral-900 dark:text-zinc-200">
                            {user.createdAt.substring(0, 10)}
                          </td>
                          <td className="px-4 py-5">
                            {user.isAdmin ? (
                              <p className="flex items-center gap-2">
                                <Crown className="text-blue-500 dark:text-blue-400" />
                              </p>
                            ) : (
                              <p className="text-zinc-500 dark:text-zinc-400">--</p>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-gray-500 dark:text-zinc-400">
                          {t.noUsersFound}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <Paginate page={page} pages={pages} setPage={setPage} />
              </div>

              {/* ✅ Mobile cards */}
              <div className="lg:hidden">
                {filteredUsers.length > 0 ? (
                  <div className="space-y-3">
                    {filteredUsers.map((user: any) => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => navigate(`/userlist/${user._id}`)}
                        className="w-full text-left rounded-xl border bg-white dark:bg-zinc-950 dark:border-white/10 p-4 active:scale-[0.99] transition">
                        <div className="flex items-start justify-between gap-3">
                          {/* ✅ Left: avatar + name/email */}
                          <div className="min-w-0 flex items-start gap-3">
                            <Avatar user={user} />
                            <div className="min-w-0">
                              <p className="font-black text-sm text-neutral-900 dark:text-white truncate">
                                {user?.name || "-"}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-0.5 truncate">
                                {user?.email || "-"}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {user?.isAdmin ? (
                              <span className="inline-flex items-center justify-center h-9 w-9 rounded-xl border bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20">
                                <Crown className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold px-3 py-1 rounded-full border bg-neutral-50 text-neutral-700 dark:bg-white/5 dark:text-zinc-200 dark:border-white/10">
                                {t.user}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg bg-neutral-50 border px-3 py-2 dark:bg-white/5 dark:border-white/10">
                            <p className="text-neutral-500 dark:text-zinc-400">{t.phone}</p>
                            <p className="font-bold text-neutral-900 dark:text-white truncate">
                              {user?.phone || "-"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-neutral-50 border px-3 py-2 dark:bg-white/5 dark:border-white/10">
                            <p className="text-neutral-500 dark:text-zinc-400">{t.registeredIn}</p>
                            <p className="font-bold text-neutral-900 dark:text-white">
                              {user?.createdAt?.substring(0, 10) || "-"}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border bg-white dark:bg-zinc-950 dark:border-white/10 p-6 text-center text-sm text-gray-500 dark:text-zinc-400">
                    {t.noUsersFound}
                  </div>
                )}

                <div className="mt-4">
                  <Paginate page={page} pages={pages} setPage={setPage} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Customers;
