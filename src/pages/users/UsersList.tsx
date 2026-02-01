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

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

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
                className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-5 items-center flex-wrap">
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

            <Separator className="my-4 bg-black/20" />

            <div className="mt-5 mb-2 overflow-hidden">
              {/* Search */}
              <div className="relative w-full lg:w-64 mb-5">
                <span
                  className={`
                    absolute inset-y-0 flex items-center text-gray-400
                    ${isRTL ? "right-0 pr-3" : "left-0 pl-3"}
                  `}>
                  <Search className="h-5 w-5" />
                </span>

                <input
                  dir={isRTL ? "rtl" : "ltr"}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1); // ✅ reset page on new search
                  }}
                  placeholder={t.searchPlaceholder}
                  className={`
                    w-full border bg-white border-gray-300 rounded-lg py-3 text-sm
                    focus:outline-none focus:border-blue-500 focus:border-2
                    ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"}
                  `}
                />
              </div>

              {/* ✅ Desktop table (unchanged design) */}
              <div className="hidden lg:block rounded-lg border lg:p-5 overflow-x-scroll md:overflow-auto bg-white">
                <table className="w-full rounded-lg text-xs lg:text-sm border-gray-200 text-left text-gray-700">
                  <thead className="bg-white text-gray-900/50 font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b">{t.name}</th>
                      <th className="px-4 py-3 border-b">{t.email}</th>
                      <th className="px-4 py-3 border-b">{t.phone}</th>
                      <th className="px-4 py-3 border-b">{t.registeredIn}</th>
                      <th className="px-4 py-3 border-b">{t.admin}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user: any) => (
                        <tr
                          key={user._id}
                          className="cursor-pointer hover:bg-gray-100 transition-all duration-300 font-bold"
                          onClick={() => navigate(`/userlist/${user._id}`)}>
                          <td className="px-4 py-5">{user.name}</td>
                          <td className="px-4 py-5">{user.email}</td>
                          <td className="px-4 py-5">{user.phone}</td>
                          <td className="px-4 py-5">{user.createdAt.substring(0, 10)}</td>
                          <td className="px-4 py-5">
                            {user.isAdmin ? (
                              <p className="flex items-center gap-2">
                                <Crown className="text-blue-500" />
                              </p>
                            ) : (
                              <p>{t.user}</p>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
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
                        className="w-full text-left rounded-xl border bg-white p-4 active:scale-[0.99] transition">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-black text-sm text-neutral-900 truncate">
                              {user?.name || "-"}
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5 truncate">
                              {user?.email || "-"}
                            </p>
                          </div>

                          <div className="shrink-0">
                            {user?.isAdmin ? (
                              <span className="inline-flex items-center justify-center h-9 w-9 rounded-xl border bg-blue-50 border-blue-200">
                                <Crown className="h-4 w-4 text-blue-600" />
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold px-3 py-1 rounded-full border bg-neutral-50 text-neutral-700">
                                {t.user}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg bg-neutral-50 border px-3 py-2">
                            <p className="text-neutral-500">{t.phone}</p>
                            <p className="font-bold text-neutral-900 truncate">
                              {user?.phone || "-"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-neutral-50 border px-3 py-2">
                            <p className="text-neutral-500">{t.registeredIn}</p>
                            <p className="font-bold text-neutral-900">
                              {user?.createdAt?.substring(0, 10) || "-"}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">
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
