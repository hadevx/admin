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
  Loader2Icon,
  ScrollText,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useLogoutMutation } from "../redux/queries/userApi";
import { toast } from "react-toastify";
import { Separator } from "./ui/separator";
import { useState } from "react";
/* import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Mail, User } from "lucide-react"; */
import { motion } from "framer-motion";
import { useEffect } from "react";
import logo from "../assets/logo.png";

function SideMenu() {
  const [logoutApiCall, { isLoading: loadingLogout }] = useLogoutMutation();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const language = useSelector((state: any) => state.language.lang);
  const { adminUserInfo } = useSelector((state: any) => state.auth);

  const dispatch = useDispatch();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApiCall(undefined).unwrap();
      dispatch(logout());
      // toast.success(res.message);
      navigate("/admin/login");
      setIsMenuOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Logout failed");
    }
  };
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup on unmount
    return () => document.body.classList.remove("overflow-hidden");
  }, [isMenuOpen]);

  const labels: any = {
    en: {
      summary: "Summary",
      orders: "Orders",
      products: "Products",
      categories: "Categories",
      customers: "Customers",
      discounts: "Discounts",
      delivery: "Delivery",
      settings: "Settings",
      logout: "Logout",
      loggingOut: "Logging out...",
    },
    ar: {
      summary: "الملخص",
      orders: "الطلبات",
      products: "المنتجات",
      categories: "الفئات",
      customers: "العملاء",
      discounts: "الخصومات",
      delivery: "التوصيل",
      settings: "الإعدادات",
      logout: "تسجيل الخروج",
      loggingOut: "جاري تسجيل الخروج...",
    },
  };

  const t = labels[language];

  // Your exact menu content JSX (same as desktop)
  const menuContent = (
    <div className="flex flex-col h-full text-black px-2 lg:px-[2rem] py-[2rem] border-r-[2px] w-64 lg:w-auto min-h-screen ">
      <div className="mt-10 flex items-center gap-2 p-2">
        <a href="https://webschema.online" target="_blank">
          <motion.div
            whileHover={{ scale: 0.95 }}
            className="rounded-full select-none border-2 border-gray-400 hover:border-gray-900 size-12 flex justify-center items-center transition">
            <div className="rounded-full hover:opacity-80 bg-gradient-to-r shadow-md from-zinc-600 to-zinc-800 text-white size-10 flex justify-center items-center font-semibold text-lg">
              {/*    {adminUserInfo?.name.charAt(0).toUpperCase()}
            {adminUserInfo?.name.charAt(adminUserInfo?.name.length - 1).toUpperCase()} */}
              <img src={logo} alt="logo" width={"25px"} />
            </div>
          </motion.div>
        </a>
        <div>
          <p className="text-sm font-bold">{adminUserInfo?.name}</p>
          <p className="text-sm text-gray-500">{adminUserInfo?.email}</p>
        </div>
      </div>

      <Separator className="my-4 bg-black/20" />

      <div className="flex flex-col lg:justify-start h-full">
        <div className="flex flex-col gap-3  max-h-[calc(100vh-300px)]">
          <Link
            to="/admin/summary"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname === "/admin/summary" && "bg-white shadow"
            )}>
            <ScrollText strokeWidth={1} />
            <p>{t.summary}</p>
          </Link>
          <Link
            to="/admin"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              (pathname === "/admin" || pathname.startsWith("/admin/orders")) && "bg-white shadow"
            )}>
            <ShoppingBasket strokeWidth={1} />
            <p>{t.orders}</p>
          </Link>
          <Link
            to="/admin/productlist"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname.startsWith("/admin/productlist") && "bg-white shadow"
            )}>
            <Box strokeWidth={1} />
            <p>{t.products}</p>
          </Link>
          <Link
            to="/admin/categories"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow-[0_0_5px_rgba(0,0,0,0.1)]",
              pathname === "/admin/categories" && "bg-white shadow-[0_0_5px_rgba(0,0,0,0.1)]"
            )}>
            <Boxes strokeWidth={1} />
            <p>{t.categories}</p>
          </Link>
          <Link
            to="/admin/userlist"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname.startsWith("/admin/userlist") && "bg-white shadow"
            )}>
            <Users strokeWidth={1} />
            <p>{t.customers}</p>
          </Link>
          <Link
            to="/admin/discounts"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname.startsWith("/admin/discounts") && "bg-white shadow"
            )}>
            <TicketPercent strokeWidth={1} />
            <p>{t.discounts}</p>
          </Link>
          <Link
            to="/admin/delivery"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname === "/admin/delivery" && "bg-white shadow"
            )}>
            <Truck strokeWidth={1} />
            <p>{t.delivery}</p>
          </Link>
          <Link
            to="/admin/settings"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "group flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300 ",
              pathname === "/admin/settings" && "bg-white shadow"
            )}>
            <Settings
              strokeWidth={1}
              className="transition-transform duration-300 group-hover:rotate-180"
            />
            <p>{t.settings}</p>
          </Link>
        </div>

        <div>
          <Separator className="my-4 bg-black/20" />
          <button
            onClick={handleLogout}
            className="items-center hover:font-bold cursor-pointer transition-all duration-100 w-full flex gap-3 bg-gradient-to-t hover:from-rose-500 hover:to-rose-400 hover:text-white text-black px-3 py-2 rounded-lg hover:shadow-md">
            {loadingLogout ? (
              <>
                <Loader2Icon className="animate-spin" />
                <p>{t.loggingOut}</p>
              </>
            ) : (
              <>
                <LogOut strokeWidth={1} />
                <p>{t.logout}</p>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Responsive additions below:

  return (
    <>
      <button
        className="lg:hidden  drop-shadow-[0_0_10px_rgba(24,24,27,0.5)] fixed top-4 left-4 z-50 p-2 rounded-md bg-zinc-900 text-white"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-label="Toggle menu">
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="hidden lg:flex  z-50">{menuContent}</div>

      {isMenuOpen && (
        <div
          className={clsx("fixed inset-0 backdrop-blur-sm z-40")}
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full w-64 bg-zinc-100 shadow-lg z-50"
            onClick={(e) => e.stopPropagation()}>
            {menuContent}
          </motion.div>
        </div>
      )}
    </>
  );
}

export default SideMenu;
