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
      navigate("/login");
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
      <div className="mt-10 flex items-center gap-3 p-2">
        <a
          href="https://webschema.online"
          target="_blank"
          rel="noreferrer"
          className="shrink-0"
          aria-label="Open website">
          <motion.div
            whileHover={{ scale: 0.96 }}
            whileTap={{ scale: 0.98 }}
            className="relative rounded-2xl select-none border border-white/10 bg-black
                 shadow-[0_14px_40px_rgba(0,0,0,0.35)]
                 h-12 w-12 flex items-center justify-center transition">
            <div
              className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900
                      border border-white/10 shadow-md grid place-items-center">
              <img src={logo} alt="logo" className="h-6 w-6 object-contain" />
            </div>

            {/* small online dot */}
            <span
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full
                   bg-emerald-500 border-2 border-black"
              aria-hidden="true"
            />
          </motion.div>
        </a>

        <div className="min-w-0">
          <p className="text-sm font-black text-neutral-900 truncate">{adminUserInfo?.name}</p>
          <p className="text-xs text-neutral-500 truncate">{adminUserInfo?.email}</p>
        </div>
      </div>

      <Separator className="my-4 bg-black/20" />

      <div className="flex flex-col lg:justify-start h-full">
        <div className="flex flex-col gap-3  max-h-[calc(100vh-300px)]">
          <Link
            to="/summary"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname === "/summary" && "bg-white shadow",
            )}>
            <ScrollText strokeWidth={1} />
            <p>{t.summary}</p>
          </Link>
          <Link
            to="/orders"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              (pathname === "/orders" || pathname.startsWith("/orders")) && "bg-white shadow",
            )}>
            <ShoppingBasket strokeWidth={1} />
            <p>{t.orders}</p>
          </Link>
          <Link
            to="/productlist"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname.startsWith("/productlist") && "bg-white shadow",
            )}>
            <Box strokeWidth={1} />
            <p>{t.products}</p>
          </Link>
          <Link
            to="/categories"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow-[0_0_5px_rgba(0,0,0,0.1)]",
              pathname === "/categories" && "bg-white shadow-[0_0_5px_rgba(0,0,0,0.1)]",
            )}>
            <Boxes strokeWidth={1} />
            <p>{t.categories}</p>
          </Link>
          <Link
            to="/userlist"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname.startsWith("/userlist") && "bg-white shadow",
            )}>
            <Users strokeWidth={1} />
            <p>{t.customers}</p>
          </Link>
          <Link
            to="/discounts"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname.startsWith("/discounts") && "bg-white shadow",
            )}>
            <TicketPercent strokeWidth={1} />
            <p>{t.discounts}</p>
          </Link>
          <Link
            to="/delivery"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300",
              pathname === "/delivery" && "bg-white shadow",
            )}>
            <Truck strokeWidth={1} />
            <p>{t.delivery}</p>
          </Link>
          <Link
            to="/settings"
            onClick={() => setIsMenuOpen(false)}
            className={clsx(
              "group flex gap-3 hover:bg-white px-3 py-2 rounded-lg hover:shadow transition-all duration-300 ",
              pathname === "/settings" && "bg-white shadow",
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
            disabled={loadingLogout}
            className="
    w-full flex items-center justify-center gap-2
    px-4 py-3 rounded-xl text-sm font-semibold
    border border-rose-200 bg-rose-50 text-rose-700
    hover:bg-rose-100 hover:border-rose-300
    transition-all duration-200
    disabled:opacity-60 disabled:cursor-not-allowed
  ">
            {loadingLogout ? (
              <>
                <Loader2Icon className="animate-spin" size={16} />
                {t.loggingOut}
              </>
            ) : (
              <>
                <LogOut size={16} />
                {t.logout}
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
