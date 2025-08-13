import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  ShoppingBasket,
  Box,
  Boxes,
  Users,
  TicketPercent,
  LogOut,
  Truck,
  Settings,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useLogoutMutation } from "../redux/queries/userApi";
import { toast } from "react-toastify";
import { Separator } from "./ui/separator";
import { useState, useContext } from "react";
import { StoreContext } from "../StorenameContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Mail, User } from "lucide-react";

function SideMenu() {
  const [logoutApiCall] = useLogoutMutation();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const storeName = useContext(StoreContext);

  const handleLogout = async () => {
    const res = await logoutApiCall().unwrap();
    dispatch(logout());
    toast.success(res.message);
    navigate("/admin/login");
  };

  console.log(userInfo);
  return (
    <div className=" lg:flex flex-col  w-auto text-sm lg:text-lg lg:w-[15%]  min-h-screen text-black px-2 lg:px-[2rem] py-[2rem] border-r-[2px]">
      <div>
        <Popover>
          <PopoverTrigger>
            <div className="rounded-full mb-3 select-none border-2  border-gray-400 hover:border-gray-900 size-8 lg:size-12 flex justify-center items-center transition">
              <div className="rounded-full bg-gradient-to-r shadow-md from-zinc-600 to-zinc-800 text-white size-6 lg:size-10 flex justify-center items-center font-semibold text-xs lg:text-lg">
                {userInfo?.name.charAt(0).toUpperCase()}
                {userInfo?.name.charAt(userInfo?.name.length - 1).toUpperCase()}
              </div>
            </div>
          </PopoverTrigger>

          <PopoverContent className="w-64 p-4 rounded-xl shadow-lg bg-white border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-semibold text-gray-800">Welcome back </p>
              <p className="text-sm  text-gray-500 flex items-center gap-1">
                {" "}
                <User size={"16px"} />
                {userInfo.name}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Mail size={"16px"} />
                {userInfo.email}
              </p>
              <Separator className="my-4 bg-black/20" />
              <button
                onClick={handleLogout}
                className=" bg-zinc-900 text-white w-full p-2 hover:bg-zinc-700 transition-all duration-300  ">
                Logout
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <h1 className="font-bold mb-7 hidden lg:block">{storeName}</h1>
      </div>
      <Separator className="my-4 bg-black/20" />

      <div className="flex  flex-col justify-between h-full">
        <div className="flex flex-col gap-3 ">
          <Link
            to="/admin"
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              (pathname === "/admin" || pathname.startsWith("/admin/orders")) && "bg-white shadow"
            )}>
            <ShoppingBasket strokeWidth={1} />
            <p className="hidden lg:block">Orders</p>
          </Link>
          <Link
            to="/admin/productlist"
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname.startsWith("/admin/productlist") && "bg-white shadow"
            )}>
            <Box strokeWidth={1} />
            <p className="hidden lg:block">Products</p>
          </Link>
          <Link
            to="/admin/categories"
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow-[0_0_5px_rgba(0,0,0,0.1)]",
              pathname === "/admin/categories" && "bg-white shadow-[0_0_5px_rgba(0,0,0,0.1)]"
            )}>
            <Boxes strokeWidth={1} />
            <p className="hidden lg:block">Categories</p>
          </Link>
          <Link
            to="/admin/userlist"
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname.startsWith("/admin/userlist") && "bg-white shadow"
            )}>
            <Users strokeWidth={1} />
            <p className="hidden lg:block">Customers</p>
          </Link>
          <Link
            to="/admin/discounts"
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname.startsWith("/admin/discounts") && "bg-white shadow"
            )}>
            <TicketPercent strokeWidth={1} />
            <p className="hidden lg:block">Discounts</p>
          </Link>
          <Link
            to="/admin/delivery"
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname === "/admin/delivery" && "bg-white shadow"
            )}>
            <Truck strokeWidth={1} />
            <p className="hidden lg:block">Delivery</p>
          </Link>
          <Link
            to="/admin/settings"
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname === "/admin/settings" && "bg-white shadow"
            )}>
            <Settings strokeWidth={1} />
            <p className="hidden lg:block">Settings</p>
          </Link>
        </div>
        <div className="hidden lg:block">
          <Separator className="my-4 bg-black/20" />
          <button
            onClick={handleLogout}
            className="  items-center cursor-pointer transition-all duration-100  w-full flex gap-3 bg-gradient-to-t  hover:from-rose-500 hover:to-rose-400 hover:text-white text-black px-3 py-2 rounded-lg hover:shadow-md">
            <LogOut strokeWidth={1} />
            <p className="hidden lg:block">Logout</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
