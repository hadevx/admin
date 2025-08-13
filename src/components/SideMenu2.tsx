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
  Menu,
  X,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useLogoutMutation } from "../redux/queries/userApi";
import { toast } from "react-toastify";
import { Separator } from "./ui/separator";
import { useState } from "react";
/* import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Mail, User } from "lucide-react"; */

function SideMenu() {
  const [logoutApiCall] = useLogoutMutation();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const { userInfo } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res: any = await logoutApiCall(undefined).unwrap();
      dispatch(logout());
      toast.success(res.message);
      navigate("/admin/login");
      setIsMenuOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Logout failed");
    }
  };

  // Your exact menu content JSX (same as desktop)
  const menuContent = (
    <div className="flex flex-col h-full text-black px-2 lg:px-[2rem] py-[2rem]  border-r-[2px] w-64 lg:w-auto min-h-screen">
      <div className="mt-10  flex items-center gap-2  p-2">
        <div className="rounded-full   select-none border-2 border-gray-400 hover:border-gray-900 size-12  flex justify-center items-center transition">
          <div className="rounded-full hover:opacity-80  bg-gradient-to-r shadow-md from-zinc-600 to-zinc-800 text-white size-10  flex justify-center items-center font-semibold text-lg">
            {userInfo?.name.charAt(0).toUpperCase()}
            {userInfo?.name.charAt(userInfo?.name.length - 1).toUpperCase()}
          </div>
        </div>

        <div className="">
          <p className="  text-sm font-bold ">{userInfo?.name}</p>
          <p className="text-sm text-gray-500 ">{userInfo?.email}</p>
        </div>
      </div>

      <Separator className="my-4 bg-black/20" />

      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-3 overflow-auto max-h-[calc(100vh-320px)]">
          <Link
            to="/admin"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              (pathname === "/admin" || pathname.startsWith("/admin/orders")) && "bg-white shadow"
            )}>
            <ShoppingBasket strokeWidth={1} />
            <p className=" ">Orders</p>
          </Link>
          <Link
            to="/admin/productlist"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname.startsWith("/admin/productlist") && "bg-white shadow"
            )}>
            <Box strokeWidth={1} />
            <p className="">Products</p>
          </Link>
          <Link
            to="/admin/categories"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow-[0_0_5px_rgba(0,0,0,0.1)]",
              pathname === "/admin/categories" && "bg-white shadow-[0_0_5px_rgba(0,0,0,0.1)]"
            )}>
            <Boxes strokeWidth={1} />
            <p className="">Categories</p>
          </Link>
          <Link
            to="/admin/userlist"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname.startsWith("/admin/userlist") && "bg-white shadow"
            )}>
            <Users strokeWidth={1} />
            <p className="">Customers</p>
          </Link>
          <Link
            to="/admin/discounts"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname.startsWith("/admin/discounts") && "bg-white shadow"
            )}>
            <TicketPercent strokeWidth={1} />
            <p className="">Discounts</p>
          </Link>
          <Link
            to="/admin/delivery"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname === "/admin/delivery" && "bg-white shadow"
            )}>
            <Truck strokeWidth={1} />
            <p className="">Delivery</p>
          </Link>
          <Link
            to="/admin/settings"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname === "/admin/settings" && "bg-white shadow"
            )}>
            <Settings strokeWidth={1} />
            <p className="">Settings</p>
          </Link>
        </div>

        <div className="">
          <Separator className="my-4 bg-black/20" />
          <button
            onClick={handleLogout}
            className="items-center cursor-pointer transition-all duration-100 w-full flex gap-3 bg-gradient-to-t hover:from-rose-500 hover:to-rose-400 hover:text-white text-black px-3 py-2 rounded-lg hover:shadow-md">
            <LogOut strokeWidth={1} />
            <p className="">Logout</p>
          </button>
        </div>
      </div>
    </div>
  );

  // Responsive additions below:

  return (
    <>
      {/* Hamburger button: visible only on mobile */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-zinc-900 text-white"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-label="Toggle menu">
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop sidebar (unchanged) */}
      <div className="hidden lg:flex">{menuContent}</div>

      {/* Mobile menu drawer */}
      {isMenuOpen && (
        <div
          className="fixed inset-0  backdrop-blur-md z-40"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true">
          <div
            className="fixed left-0 top-0 h-full w-64 bg-zinc-100  shadow-lg z-50"
            onClick={(e) => e.stopPropagation()}>
            {menuContent}
          </div>
        </div>
      )}
    </>
  );
}

export default SideMenu;
