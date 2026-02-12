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
  ChevronDown,
  Codepen,
  Percent,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useLogoutMutation } from "../redux/queries/userApi";
import { toast } from "react-toastify";
import { Separator } from "./ui/separator";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

function SideMenu() {
  const [logoutApiCall, { isLoading: loadingLogout }] = useLogoutMutation();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const language = useSelector((state: any) => state.language.lang);
  const { adminUserInfo } = useSelector((state: any) => state.auth);

  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ✅ Dropdown state for Promotions
  const [promotionsOpen, setPromotionsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApiCall(undefined).unwrap();
      dispatch(logout());
      navigate("/login");
      setIsMenuOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Logout failed");
    }
  };

  useEffect(() => {
    if (isMenuOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [isMenuOpen]);

  // ✅ Keep dropdown opened when current route is inside it
  useEffect(() => {
    if (pathname.startsWith("/discounts") || pathname.startsWith("/coupons")) {
      setPromotionsOpen(true);
    }
  }, [pathname]);

  const labels: any = {
    en: {
      summary: "Summary",
      orders: "Orders",
      products: "Products",
      categories: "Categories",
      customers: "Customers",
      promotions: "Promotions",
      coupons: "Coupons",
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
      promotions: "العروض",
      coupons: "الكوبونات",
      discounts: "الخصومات",
      delivery: "التوصيل",
      settings: "الإعدادات",
      logout: "تسجيل الخروج",
      loggingOut: "جاري تسجيل الخروج...",
    },
  };

  const t = labels[language];

  const isPromotionsActive = useMemo(
    () => pathname.startsWith("/discounts") || pathname.startsWith("/coupons"),
    [pathname],
  );

  const closeMobileMenu = () => setIsMenuOpen(false);

  // ---- Menu content ----
  const menuContent = (
    <div
      className={clsx(
        "flex flex-col h-full px-2 lg:px-[2rem] py-[2rem] border-r-[2px] w-64 lg:w-auto min-h-screen",
        " text-neutral-900 border-black/10",
        "dark:bg-neutral-950 dark:text-neutral-100 dark:border-neutral-800",
      )}>
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
            className="relative select-none size-10 flex items-center justify-center transition">
            <img src="/webschema.jpeg" alt="logo" className="rounded-lg object-contain" />
            <span
              className={clsx(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2",
                "border-white dark:border-neutral-950",
              )}
              aria-hidden="true"
            />
          </motion.div>
        </a>

        <div className="min-w-0">
          <p className="text-sm font-black text-neutral-900 dark:text-neutral-50 truncate">
            {adminUserInfo?.name}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
            {adminUserInfo?.email}
          </p>
        </div>
      </div>

      <Separator className="my-4 bg-black/20 dark:bg-white/10" />

      <div className="flex flex-col lg:justify-start h-full">
        <div className="flex flex-col gap-3 max-h-[calc(100vh-300px)]">
          <Link
            to="/summary"
            onClick={closeMobileMenu}
            className={clsx(
              "flex gap-3 px-3 py-2 rounded-lg transition-all duration-300",
              "hover:shadow",
              "dark:hover:bg-neutral-900/70 dark:hover:shadow-none",
              pathname === "/summary" && "bg-white shadow dark:bg-neutral-900/70 dark:shadow-none",
            )}>
            <ScrollText strokeWidth={1} />
            <p>{t.summary}</p>
          </Link>

          <Link
            to="/orders"
            onClick={closeMobileMenu}
            className={clsx(
              "flex gap-3 px-3 py-2 rounded-lg transition-all duration-300",
              " hover:shadow",
              "dark:hover:bg-neutral-900/70 dark:hover:shadow-none",
              (pathname === "/orders" || pathname.startsWith("/orders")) &&
                "bg-white shadow dark:bg-neutral-900/70 dark:shadow-none",
            )}>
            <ShoppingBasket strokeWidth={1} />
            <p>{t.orders}</p>
          </Link>

          <Link
            to="/products"
            onClick={closeMobileMenu}
            className={clsx(
              "flex gap-3 px-3 py-2 rounded-lg transition-all duration-300",
              " hover:shadow",
              "dark:hover:bg-neutral-900/70 dark:hover:shadow-none",
              pathname.startsWith("/products") &&
                "bg-white shadow dark:bg-neutral-900/70 dark:shadow-none",
            )}>
            <Box strokeWidth={1} />
            <p>{t.products}</p>
          </Link>

          <Link
            to="/categories"
            onClick={closeMobileMenu}
            className={clsx(
              "flex gap-3 px-3 py-2 rounded-lg transition-all duration-300",
              " hover:shadow-[0_0_5px_rgba(0,0,0,0.1)]",
              "dark:hover:bg-neutral-900/70 dark:hover:shadow-none",
              pathname === "/categories" &&
                "bg-white shadow-[0_0_5px_rgba(0,0,0,0.1)] dark:bg-neutral-900/70 dark:shadow-none",
            )}>
            <Boxes strokeWidth={1} />
            <p>{t.categories}</p>
          </Link>

          <Link
            to="/users"
            onClick={closeMobileMenu}
            className={clsx(
              "flex gap-3 px-3 py-2 rounded-lg transition-all duration-300",
              " hover:shadow",
              "dark:hover:bg-neutral-900/70 dark:hover:shadow-none",
              pathname.startsWith("/users") &&
                "bg-white shadow dark:bg-neutral-900/70 dark:shadow-none",
            )}>
            <Users strokeWidth={1} />
            <p>{t.customers}</p>
          </Link>

          {/* ✅ Promotions dropdown (Discounts + Coupons) */}
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => setPromotionsOpen((v) => !v)}
              className={clsx(
                "group flex w-full items-center justify-between px-3 py-2 rounded-lg transition-all duration-300",
                " hover:shadow",
                "dark:hover:bg-neutral-900/70 dark:hover:shadow-none",
                isPromotionsActive && "bg-white shadow dark:bg-neutral-900/70 dark:shadow-none",
              )}>
              <span className="flex items-center gap-3">
                <Percent strokeWidth={1} />
                <p>{t.promotions}</p>
              </span>

              <ChevronDown
                className={clsx(
                  "h-4 w-4 transition-transform duration-300",
                  promotionsOpen ? "rotate-180" : "rotate-0",
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {promotionsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden">
                  <div className="mt-2 ml-3 flex flex-col gap-2">
                    <Link
                      to="/discounts"
                      onClick={closeMobileMenu}
                      className={clsx(
                        "flex gap-3 px-3 py-2 rounded-lg transition-all duration-300",
                        " hover:shadow",
                        "dark:hover:bg-neutral-900/70 dark:hover:shadow-none",
                        pathname.startsWith("/discounts") &&
                          "bg-white shadow dark:bg-neutral-900/70 dark:shadow-none",
                      )}>
                      <TicketPercent strokeWidth={1} className="opacity-80" />
                      <p>{t.discounts}</p>
                    </Link>

                    <Link
                      to="/coupons"
                      onClick={closeMobileMenu}
                      className={clsx(
                        "flex gap-3 px-3 py-2 rounded-lg transition-all duration-300",
                        " hover:shadow",
                        "dark:hover:bg-neutral-900/70 dark:hover:shadow-none",
                        pathname.startsWith("/coupons") &&
                          "bg-white shadow dark:bg-neutral-900/70 dark:shadow-none",
                      )}>
                      <Codepen strokeWidth={1} className="opacity-80" />
                      <p>{t.coupons}</p>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/delivery"
            onClick={closeMobileMenu}
            className={clsx(
              "flex gap-3 px-3 py-2 rounded-lg transition-all duration-300",
              " hover:shadow",
              "dark:hover:bg-neutral-900/70 dark:hover:shadow-none",
              pathname === "/delivery" && "bg-white shadow dark:bg-neutral-900/70 dark:shadow-none",
            )}>
            <Truck strokeWidth={1} />
            <p>{t.delivery}</p>
          </Link>

          <Link
            to="/settings"
            onClick={closeMobileMenu}
            className={clsx(
              "group flex gap-3 px-3 py-2 rounded-lg transition-all duration-300",
              " hover:shadow",
              "dark:hover:bg-neutral-900/70 dark:hover:shadow-none",
              pathname === "/settings" && "bg-white shadow dark:bg-neutral-900/70 dark:shadow-none",
            )}>
            <Settings
              strokeWidth={1}
              className="transition-transform duration-300 group-hover:rotate-180"
            />
            <p>{t.settings}</p>
          </Link>
        </div>

        <div>
          <Separator className="my-4 bg-black/20 dark:bg-white/10" />
          <button
            onClick={handleLogout}
            disabled={loadingLogout}
            className={clsx(
              "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
              "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300",
              "dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/60 dark:hover:border-rose-900",
              "disabled:opacity-60 disabled:cursor-not-allowed",
            )}>
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

  return (
    <>
      <div className="">
        <button
          className={clsx(
            "lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md shadow",
            "bg-zinc-900 text-white",
            "dark:bg-neutral-100 dark:text-neutral-950",
          )}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle menu">
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        {/* <ThemeToggle /> */}
      </div>
      <div className="hidden lg:flex z-50">{menuContent}</div>

      {isMenuOpen && (
        <div
          className={clsx("fixed inset-0 backdrop-blur-sm z-40", "bg-black/20 dark:bg-black/50")}
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={clsx(
              "fixed left-0 top-0 h-full w-64 shadow-lg z-50",
              "bg-zinc-100",
              "dark:bg-neutral-950",
            )}
            onClick={(e) => e.stopPropagation()}>
            {menuContent}
          </motion.div>
        </div>
      )}
    </>
  );
}

export default SideMenu;
