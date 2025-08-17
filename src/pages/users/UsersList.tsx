import Layout from "../../Layout";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useGetUsersQuery } from "../../redux/queries/userApi";
import { Search, Crown } from "lucide-react";
import { Users } from "lucide-react";
import Badge from "../../components/Badge";
import { Separator } from "../../components/ui/separator";
import Loader from "../../components/Loader";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading } = useGetUsersQuery<any>({ pageNumber: page, keyword: searchQuery });
  const users = data?.users || [];
  const pages = data?.pages || 1;
  const totalUsers = data?.total || 0;

  const navigate = useNavigate();
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    if (data) {
      const filtered = users.filter((user: any) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [data, searchQuery]);

  /*   const handleAdd = () => {
    setIsModalOpen(true);
  }; */
  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="lg:px-4 mb-10 lg:w-4xl  w-full min-h-screen lg:min-h-auto flex text-xs lg:text-lg  justify-between py-3 mt-[50px] px-4  ">
          <div className="w-full">
            <div className="flex justify-between items-center ">
              <h1 className=" text-lg lg:text-2xl font-black flex gap-2 lg:gap-5 items-center">
                Users:{" "}
                <Badge icon={false}>
                  <Users strokeWidth={1} />
                  <p className="text-lg lg:text-sm">
                    {totalUsers > 0 ? totalUsers : "0"}{" "}
                    <span className="hidden lg:inline">users</span>
                  </p>
                </Badge>
              </h1>
            </div>
            <Separator className="my-4 bg-black/20" />

            <div className=" mt-10 mb-2 overflow-hidden ">
              <div className="relative w-full lg:w-64 mb-5">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Search className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by email"
                  className="w-full border bg-white border-gray-300 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
                />
              </div>

              <div className=" rounded-lg border lg:p-10 overflow-x-scrol md:overflow-auto  bg-white">
                <table className="w-full rounded-lg text-xs lg:text-sm  border-gray-200  text-left text-gray-700 ">
                  <thead className="bg-white text-gray-900/50 font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b">Name</th>
                      <th className="px-4 py-3 border-b">Email</th>
                      <th className="px-4 py-3 border-b">Phone</th>
                      <th className="px-4 py-3 border-b">Registered in</th>
                      <th className="px-4 py-3 border-b">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user: any) => (
                        <tr
                          className="cursor-pointer hover:bg-gray-100 transition-all duration-300 font-bold"
                          onClick={() => navigate(`/admin/userlist/${user._id}`)}>
                          <td className="px-4 py-5 ">{user.name}</td>
                          <td className="px-4 py-5 ">{user.email}</td>
                          <td className="px-4 py-5 ">{user.phone}</td>
                          <td className="px-4 py-5 ">{user.createdAt.substring(0, 10)}</td>
                          <td className="px-4 py-5 ">
                            {" "}
                            {user.isAdmin ? (
                              <p className="flex items-center gap-2">
                                <Crown className="text-blue-500" />
                              </p>
                            ) : (
                              <p>User</p>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => page > 1 && setPage(page - 1)} href="#" />
                    </PaginationItem>

                    {[...Array(pages).keys()].map((x) => (
                      <PaginationItem key={x + 1}>
                        <PaginationLink
                          href="#"
                          isActive={page === x + 1}
                          onClick={() => setPage(x + 1)}>
                          {x + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext onClick={() => page < pages && setPage(page + 1)} href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Customers;
