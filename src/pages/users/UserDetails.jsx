import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import clsx from "clsx";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";
import Loader from "../../components/Loader";
import { Loader2Icon } from "lucide-react";
import {
  useGetAddressQuery,
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../redux/queries/userApi";
import Message from "../../components/Message";
import Badge from "../../components/Badge";
import { useGetUserOrdersQuery } from "../../redux/queries/orderApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetUsersQuery } from "../../redux/queries/userApi";
import { Separator } from "../../components/ui/separator";

function UserDetails() {
  const { userID } = useParams();
  const navigate = useNavigate();

  const { data: userOrders } = useGetUserOrdersQuery(userID);
  const { data: user, isLoading: loadingUser, error } = useGetUserDetailsQuery(userID);
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser, { isLoading: loadingDeleteUser }] = useDeleteUserMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: userAddress, isLoading: loadingAddress } = useGetAddressQuery(userID);
  const { refetch } = useGetUsersQuery();

  const handleDeleteUser = async () => {
    try {
      if (user?.isAdmin) {
        toast.error("Cannot delete an admin user.");
        return;
      }

      await deleteUser(userID).unwrap();
      toast.success("User deleted successfully");

      refetch();
      navigate("/admin/userlist");
    } catch (error) {
      const errorMsg =
        error?.data?.message || error?.message || "An error occurred while deleting the user.";
      toast.error(errorMsg);
    }
  };

  const handleMakeAdmin = async () => {
    await updateUser({ userId: userID, isAdmin: true }).unwrap();
    refetch();
    toast.success("User updated successfully");
  };
  const handleRemoveAdmin = async () => {
    await updateUser({ userId: userID, isAdmin: false }).unwrap();
    refetch();
    toast.success("User updated successfully");
  };
  return (
    <Layout>
      <div
        className={clsx(
          "px-4 py-3 flex gap-10 flex-col text-xs lg:text-lg lg:flex-col  mt-[50px] ml-0 lg:ml-[50px] "
        )}>
        <div className="">
          <div className="flex justify-between flex-col ">
            <h1 className="text-xs lg:text-lg mb-3 font-bold">Customer's information:</h1>
            <div className="flex gap-5">
              {!user?.isAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className=" select-none text-xs lg:text-lg  bg-gradient-to-t  from-rose-500 to-rose-400 text-white px-3 py-2 rounded-lg font-bold shadow-md">
                  Delete
                </button>
              )}

              {user?.isAdmin ? (
                <button
                  onClick={handleRemoveAdmin}
                  className=" select-none  text-xs lg:text-lg  transition-all duration-300   bg-gradient-to-t  from-teal-500 to-teal-400 text-white px-3 py-2 rounded-lg font-bold shadow-md">
                  Remove from admin
                </button>
              ) : (
                <button
                  onClick={handleMakeAdmin}
                  className=" select-none  text-xs lg:text-lg  transition-all duration-300   bg-gradient-to-t  from-teal-500 to-teal-400 text-white px-3 py-2 rounded-lg font-bold shadow-md">
                  Make admin
                </button>
              )}
            </div>
          </div>
          <Separator className="my-4 bg-black/20" />

          <div className="w-[300px] relative text-xlmin-h-[500px] p-7 lg:w-4xl   bg-white shadow-md rounded-md">
            <h1 className="text-xs lg:text-lg font-bold">Personal information:</h1>
            <div className="flex lg:gap-40 mt-10">
              <div className="*:mb-5">
                <p>Name:</p>
                <p>Email:</p>
                <p>Phone:</p>
                <p>Admin:</p>
              </div>
              {loadingUser ? (
                <Loader />
              ) : (
                <div className="*:mb-5 font-bold">
                  <p>{user?.name}</p>
                  <p className="text-blue-500 underline">
                    <Link to={`mailto:${user?.email}`}>{user?.email}</Link>
                  </p>
                  <p>{user?.phone}</p>
                  <div>
                    {user?.isAdmin ? (
                      <Badge variant="admin">Admin</Badge>
                    ) : (
                      <Badge>Not admin</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {userAddress ? (
            <div className="w-[300px] mt-5 relative text-xlmin-h-[500px] p-7 lg:w-4xl  bg-white shadow-md rounded-md">
              <h1 className="text-xs lg:text-lg font-bold">Address:</h1>
              <div className="flex lg:gap-40 mt-10">
                <div className="*:mb-5 ">
                  <p>Province:</p>
                  <p>City:</p>
                  <p>Block:</p>
                  <p>Street:</p>
                  <p>House:</p>
                </div>
                {loadingAddress ? (
                  <Loader />
                ) : (
                  <div className="*:mb-5 font-bold">
                    <p>{userAddress?.governorate}</p>
                    <p>{userAddress?.city}</p>
                    <p>{userAddress?.block}</p>
                    <p>{userAddress?.street}</p>
                    <p>{userAddress?.house}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Message dismiss={false}>User does not provide address yet</Message>
            </>
          )}
          {userOrders?.length === 0 && <Message dismiss={false}>User does not have orders</Message>}
        </div>

        {userOrders?.length > 0 && (
          <div className="text-xs lg:text-lg">
            <div className="">
              <h1 className="text-xs lg:text-lg font-bold">Customer's orders:</h1>
              <Separator className="my-4 bg-black/20" />
            </div>

            <div className="flex flex-col gap-5">
              {userOrders?.map((order) => (
                <div
                  key={order._id}
                  className="flex w-[300px] lg:w-4xl  flex-col hover:bg-gray-100 transition-all duration-300 gap-5 border bg-white p-4  shadow-md rounded-lg">
                  <div className="flex flex-col gap-5 ">
                    <Link to={`/admin/orders/${order._id}`} className="flex gap-5 flex-wrap">
                      <h1 className="flex flex-col gap-2 items-center ">
                        Placed in:{" "}
                        <span className="font-bold"> {order.createdAt.substring(0, 10)}</span>
                      </h1>
                      <h1 className="flex flex-col gap-2 items-center ">
                        Payment method: <span className="font-bold">{order.paymentMethod}</span>
                      </h1>
                      <h1 className="flex flex-col gap-2 items-center">
                        Total price:{" "}
                        <span className="font-bold">{order.totalPrice.toFixed(3)} KD</span>
                      </h1>
                      <h1 className="flex flex-col gap-2 items-center">
                        Products:
                        <span className="font-bold">{order?.orderItems.length}</span>
                      </h1>
                      <h1 className="flex flex-col gap-2 items-center">
                        Delivered:
                        <span className="font-bold text-sm">
                          {order?.isDelivered ? (
                            <Badge variant="success">Delivered</Badge>
                          ) : (
                            <Badge variant="pending">Processing</Badge>
                          )}
                        </span>
                      </h1>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
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
              onClick={() => {
                // perform deletion logic here
                handleDeleteUser();
              }}>
              {loadingDeleteUser ? (
                <p>
                  <Loader2Icon className="animate-spin" />
                </p>
              ) : (
                <p> Delete</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default UserDetails;
