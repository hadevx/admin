import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import clsx from "clsx";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { Loader2Icon } from "lucide-react";
import {
  useGetAddressQuery,
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  // useUpdateUserMutation,
} from "../../redux/queries/userApi";
import Message from "../../components/Message";
import Badge from "../../components/Badge";
import { useGetUserOrdersQuery } from "../../redux/queries/orderApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetUsersQuery } from "../../redux/queries/userApi";
import { Separator } from "../../components/ui/separator";

function UserDetails() {
  const { userID } = useParams();
  const navigate = useNavigate();

  const { data: userOrders } = useGetUserOrdersQuery(userID);
  const { data: user, isLoading: loadingUser } = useGetUserDetailsQuery<any>(userID);
  // const [updateUser] = useUpdateUserMutation();
  const [deleteUser, { isLoading: loadingDeleteUser }] = useDeleteUserMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: userAddress, isLoading: loadingAddress } = useGetAddressQuery<any>(userID);
  const { refetch } = useGetUsersQuery(undefined);

  const handleDeleteUser = async () => {
    try {
      if (user && (user as any)?.isAdmin) {
        toast.error("Cannot delete an admin user.");
        return;
      }

      await deleteUser(userID).unwrap();
      toast.success("User deleted successfully");

      refetch();
      navigate("/admin/userlist");
    } catch (error: any) {
      const errorMsg =
        error?.data?.message || error?.message || "An error occurred while deleting the user.";
      toast.error(errorMsg);
    }
  };

  /*   const handleMakeAdmin = async () => {
    await updateUser({ userId: userID, isAdmin: true }).unwrap();
    refetch();
    toast.success("User updated successfully");
  };
  const handleRemoveAdmin = async () => {
    await updateUser({ userId: userID, isAdmin: false }).unwrap();
    refetch();
    toast.success("User updated successfully");
  }; */
  return (
    <Layout>
      {loadingUser || loadingAddress ? (
        <Loader />
      ) : (
        <div
          className={clsx(
            "px-4 min-h-screen lg:w-4xl py-3 w-full mb-10 flex gap-10 flex-col  lg:text-lg lg:flex-col  mt-[50px]  "
          )}>
          <div className="">
            <div className="flex justify-between items-center  ">
              <h1 className="text-lg  font-bold">Customer's information:</h1>
              <div className="flex gap-5">
                {!user?.isAdmin && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className=" select-none  lg:text-lg  bg-gradient-to-t  from-rose-500 to-rose-400 text-white px-3 py-2 rounded-lg font-bold shadow-md">
                    Delete User
                  </button>
                )}
              </div>
            </div>
            <Separator className="my-4 bg-black/20" />

            <div className=" relative mb-3 w-full p-7  bg-white shadow rounded-md">
              <section>
                <h2 className="text-lg font-bold border-b border-b-gray-200  border-gray-700 pb-2 mb-5">
                  Personal Information
                </h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-10">
                  <div className="flex flex-col">
                    <p className="text-gray-400">Name:</p>
                    <p className="font-semibold">{user?.name}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-gray-400">Email:</p>
                    <p className="font-semibold text-blue-400 underline break-words whitespace-pre-line">
                      <Link to={`mailto:${user?.email}`}>{user?.email}</Link>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Phone:</p>
                    <p className="font-semibold">{user?.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Admin:</p>
                    <div>
                      {user?.isAdmin ? (
                        <Badge variant="admin">Admin</Badge>
                      ) : (
                        <Badge>Not admin</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Address */}
              {/*  <section>
              <h2 className="text-lg font-bold border-b border-b-gray-200  border-gray-700 pb-2 mb-5">
                Address
              </h2>
              {userAddress ? (
                <div className="grid grid-cols-2 gap-y-4 gap-x-10">
                  <p className="text-gray-400">Province:</p>
                  <p className="font-semibold">{userAddress?.governorate}</p>

                  <p className="text-gray-400">City:</p>
                  <p className="font-semibold">{userAddress?.city}</p>

                  <p className="text-gray-400">Block:</p>
                  <p className="font-semibold">{userAddress?.block}</p>

                  <p className="text-gray-400">Street:</p>
                  <p className="font-semibold">{userAddress?.street}</p>

                  <p className="text-gray-400">House:</p>
                  <p className="font-semibold">{userAddress?.house}</p>
                </div>
              ) : (
                <Message dismiss={false}>User does not provide address yet</Message>
              )}
            </section> */}
            </div>

            <div className="bg-white rounded-md p-7 shadow">
              {/* Address */}
              <section>
                <h2 className="text-lg font-bold border-b border-b-gray-200  border-gray-700 pb-2 mb-5">
                  Address
                </h2>
                {userAddress ? (
                  <div className="grid grid-cols-2 gap-y-4 gap-x-10">
                    <div className="flex flex-col ">
                      <p className="text-gray-400">Governorate:</p>
                      <p className="font-semibold">{userAddress?.governorate}</p>
                    </div>

                    <div>
                      <p className="text-gray-400">City:</p>
                      <p className="font-semibold">{userAddress?.city}</p>
                    </div>

                    <div>
                      <p className="text-gray-400">Block:</p>
                      <p className="font-semibold">{userAddress?.block}</p>
                    </div>

                    <div>
                      <p className="text-gray-400">Street:</p>
                      <p className="font-semibold">{userAddress?.street}</p>
                    </div>

                    <div>
                      <p className="text-gray-400">House:</p>
                      <p className="font-semibold">{userAddress?.house}</p>
                    </div>
                  </div>
                ) : (
                  <Message dismiss={false}>User does not provide address yet</Message>
                )}
              </section>
            </div>

            {/* Orders */}
            <div className="bg-white mt-3 rounded-md p-7 shadow">
              <section>
                <h2 className="text-lg font-bold border-b border-gray-200 dark:border-gray-700 pb-2 mb-5">
                  Orders
                </h2>

                {userOrders?.length > 0 ? (
                  userOrders.map((order: any) => (
                    <div
                      key={order._id}
                      className="flex mb-2 flex-col hover:bg-gray-100 transition-all duration-300 gap-4 border bg-zinc-50  p-4 shadow-md rounded-lg w-full">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-gray-700">Placed in:</span>
                          <span className="font-bold">{order.createdAt.substring(0, 10)}</span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <span className="text-gray-700">Payment method:</span>
                          <span className="font-bold break-words">{order.paymentMethod}</span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <span className="text-gray-700">Total price:</span>
                          <span className="font-bold">{order.totalPrice.toFixed(3)} KD</span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <span className="text-gray-700">Products:</span>
                          <span className="font-bold">{order?.orderItems.length}</span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <span className="text-gray-700">Order status:</span>
                          <span className="font-bold ">
                            {order?.isDelivered ? (
                              <Badge variant="success">Delivered</Badge>
                            ) : (
                              <Badge variant="pending">Processing</Badge>
                            )}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <Message dismiss={false}>User does not have orders</Message>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          Are you sure you want to delete this user ?
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={loadingDeleteUser}
              variant="destructive"
              className="bg-gradient-to-t  from-rose-500 to-rose-400"
              onClick={() => {
                // perform deletion logic here
                handleDeleteUser();
              }}>
              {loadingDeleteUser ? <Loader2Icon className="animate-spin" /> : <p> Delete</p>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default UserDetails;
