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
  useGetUsersQuery,
} from "../../redux/queries/userApi";
import { useGetUserOrdersQuery } from "../../redux/queries/orderApi";
import Message from "../../components/Message";
import Badge from "../../components/Badge";
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
  const dir = language === "ar" ? "rtl" : "ltr";

  const { data: userOrders } = useGetUserOrdersQuery(userID);
  const { data: user, isLoading: loadingUser } = useGetUserDetailsQuery<any>(userID);
  const [deleteUser, { isLoading: loadingDeleteUser }] = useDeleteUserMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: userAddress, isLoading: loadingAddress } = useGetAddressQuery<any>(userID);
  const { refetch } = useGetUsersQuery(undefined);

  const handleDeleteUser = async () => {
    try {
      if (user?.isAdmin) {
        toast.error(
          language === "ar" ? "لا يمكن حذف مستخدم مسؤول" : "Cannot delete an admin user."
        );
        return;
      }

      await deleteUser(userID).unwrap();
      toast.success(language === "ar" ? "تم حذف المستخدم بنجاح" : "User deleted successfully");

      refetch();
      navigate("/admin/userlist");
    } catch (error: any) {
      const errorMsg =
        error?.data?.message ||
        error?.message ||
        (language === "ar"
          ? "حدث خطأ أثناء حذف المستخدم"
          : "An error occurred while deleting the user.");
      toast.error(errorMsg);
    }
  };

  return (
    <Layout>
      {loadingUser || loadingAddress ? (
        <Loader />
      ) : (
        <div
          className={clsx(
            "px-4 min-h-screen lg:w-4xl py-3 w-full mb-10 flex gap-10 flex-col mt-[50px]",
            dir === "rtl" ? "rtl" : "ltr"
          )}>
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold">
              {language === "ar" ? "معلومات العميل:" : "Customer's Information:"}
            </h1>
            {!user?.isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="select-none lg:text-lg bg-gradient-to-t from-rose-500 to-rose-400 text-white px-3 py-2 rounded-lg font-bold shadow-md">
                {language === "ar" ? "حذف المستخدم" : "Delete User"}
              </button>
            )}
          </div>

          <Separator className="my-4 bg-black/20" />

          {/* Personal Info */}
          <div className="relative mb-3 w-full p-7 bg-white shadow rounded-md">
            <section>
              <h2 className="text-lg font-bold border-b border-gray-700 pb-2 mb-5">
                {language === "ar" ? "المعلومات الشخصية" : "Personal Information"}
              </h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-10">
                <div className="flex flex-col">
                  <p className="text-gray-400">{language === "ar" ? "الاسم:" : "Name:"}</p>
                  <p className="font-semibold">{user?.name}</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-gray-400">
                    {language === "ar" ? "البريد الإلكتروني:" : "Email:"}
                  </p>
                  <p className="font-semibold text-blue-400 underline break-words whitespace-pre-line">
                    <Link to={`mailto:${user?.email}`}>{user?.email}</Link>
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">{language === "ar" ? "الهاتف:" : "Phone:"}</p>
                  <p className="font-semibold">{user?.phone}</p>
                </div>
                <div>
                  <p className="text-gray-400">{language === "ar" ? "مسؤول:" : "Admin:"}</p>
                  <div>
                    {user?.isAdmin ? (
                      <Badge variant="admin">{language === "ar" ? "مسؤول" : "Admin"}</Badge>
                    ) : (
                      <Badge>{language === "ar" ? "غير مسؤول" : "Not admin"}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Address */}
          <div className="bg-white rounded-md p-7 shadow">
            <section>
              <h2 className="text-lg font-bold border-b border-gray-700 pb-2 mb-5">
                {language === "ar" ? "العنوان" : "Address"}
              </h2>
              {userAddress ? (
                <div className="grid grid-cols-2 gap-y-4 gap-x-10">
                  <div className="flex flex-col">
                    <p className="text-gray-400">
                      {language === "ar" ? "المحافظة:" : "Governorate:"}
                    </p>
                    <p className="font-semibold">{userAddress?.governorate}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">{language === "ar" ? "المدينة:" : "City:"}</p>
                    <p className="font-semibold">{userAddress?.city}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">{language === "ar" ? "المنطقة:" : "Block:"}</p>
                    <p className="font-semibold">{userAddress?.block}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">{language === "ar" ? "الشارع:" : "Street:"}</p>
                    <p className="font-semibold">{userAddress?.street}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">{language === "ar" ? "البيت:" : "House:"}</p>
                    <p className="font-semibold">{userAddress?.house}</p>
                  </div>
                </div>
              ) : (
                <Message dismiss={false}>
                  {language === "ar"
                    ? "المستخدم لم يقدم عنواناً بعد"
                    : "User does not provide address yet"}
                </Message>
              )}
            </section>
          </div>

          {/* Orders */}
          <div className="bg-white mt-3 rounded-md p-7 shadow">
            <section>
              <h2 className="text-lg font-bold border-b border-gray-700 pb-2 mb-5">
                {language === "ar" ? "الطلبات" : "Orders"}
              </h2>
              {userOrders?.length > 0 ? (
                userOrders.map((order: any) => (
                  <div
                    key={order._id}
                    className="flex mb-2 flex-col hover:bg-gray-100 transition-all duration-300 gap-4 border bg-zinc-50 p-4 shadow-md rounded-lg w-full">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-gray-700">
                          {language === "ar" ? "تاريخ الطلب:" : "Placed in:"}
                        </span>
                        <span className="font-bold">{order.createdAt.substring(0, 10)}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-gray-700">
                          {language === "ar" ? "طريقة الدفع:" : "Payment method:"}
                        </span>
                        <span className="font-bold break-words">{order.paymentMethod}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-gray-700">
                          {language === "ar" ? "السعر الإجمالي:" : "Total price:"}
                        </span>
                        <span className="font-bold">{order.totalPrice.toFixed(3)} KD</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-gray-700">
                          {language === "ar" ? "المنتجات:" : "Products:"}
                        </span>
                        <span className="font-bold">{order?.orderItems.length}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-gray-700">
                          {language === "ar" ? "حالة الطلب:" : "Order status:"}
                        </span>
                        <span className="font-bold">
                          {order?.isDelivered ? (
                            <Badge variant="success">
                              {language === "ar" ? "تم التوصيل" : "Delivered"}
                            </Badge>
                          ) : (
                            <Badge variant="pending">
                              {language === "ar" ? "قيد المعالجة" : "Processing"}
                            </Badge>
                          )}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <Message dismiss={false}>
                  {language === "ar" ? "المستخدم ليس لديه طلبات" : "User does not have orders"}
                </Message>
              )}
            </section>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "ar" ? "حذف المستخدم" : "Delete User"}</DialogTitle>
          </DialogHeader>
          {language === "ar"
            ? "هل أنت متأكد أنك تريد حذف هذا المستخدم؟"
            : "Are you sure you want to delete this user?"}
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              disabled={loadingDeleteUser}
              variant="destructive"
              className="bg-gradient-to-t from-rose-500 to-rose-400"
              onClick={handleDeleteUser}>
              {loadingDeleteUser ? (
                <Loader2Icon className="animate-spin" />
              ) : language === "ar" ? (
                "حذف"
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default UserDetails;
