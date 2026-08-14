import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { ChevronDown, LogOut, Loader2Icon, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useLogoutMutation } from "../redux/queries/userApi";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_SECTIONS, isPathActive, type Lang, type NavItem } from "@/lib/nav";

type SideMenuProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

const labels = {
  en: { logout: "Logout", loggingOut: "Signing out…", collapse: "Collapse", expand: "Expand" },
  ar: { logout: "تسجيل الخروج", loggingOut: "جاري الخروج…", collapse: "طي", expand: "توسيع" },
} satisfies Record<Lang, Record<string, string>>;

function SideMenu({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SideMenuProps) {
  const [logoutApiCall, { isLoading: loadingLogout }] = useLogoutMutation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const language: Lang = useSelector((state: any) => state.language.lang);
  const { adminUserInfo } = useSelector((state: any) => state.auth);
  const isRTL = language === "ar";
  const t = labels[language] ?? labels.en;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Keep a group expanded whenever one of its children is the current page.
  useEffect(() => {
    const next: Record<string, boolean> = {};
    NAV_SECTIONS.forEach((section) =>
      section.items.forEach((item) => {
        if (item.children?.some((child) => isPathActive(pathname, child.to))) next[item.key] = true;
      }),
    );
    if (Object.keys(next).length) setOpenGroups((prev) => ({ ...prev, ...next }));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logoutApiCall(undefined).unwrap();
      dispatch(logout());
      onCloseMobile();
      navigate("/login");
    } catch (error: any) {
      toast.error(error?.data?.message || "Logout failed");
    }
  };

  const initials = String(adminUserInfo?.name || adminUserInfo?.email || "AD")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase();

  /** A single navigation row. `depth` indents nested children. */
  const NavLink = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const active = isPathActive(pathname, item.to);
    const Icon = item.icon;

    return (
      <Link
        to={item.to}
        onClick={onCloseMobile}
        title={collapsed ? item.label[language] : undefined}
        aria-current={active ? "page" : undefined}
        className={clsx(
          "ws-nav-link group",
          active && "ws-nav-link-active",
          collapsed && "lg:justify-center lg:px-0",
          depth > 0 && !collapsed && "ms-3 text-[13px]",
        )}>
        <Icon
          className={clsx(
            "size-[18px] shrink-0 transition-transform duration-200",
            !active && "group-hover:scale-110",
          )}
          strokeWidth={active ? 2.2 : 1.8}
        />
        <span className={clsx("truncate", collapsed && "lg:hidden")}>{item.label[language]}</span>
      </Link>
    );
  };

  /** A parent row that expands to reveal its children. */
  const NavGroup = ({ item }: { item: NavItem }) => {
    const children = item.children ?? [];
    const groupActive = children.some((child) => isPathActive(pathname, child.to));
    const open = openGroups[item.key] ?? groupActive;
    const Icon = item.icon;

    const disclosure = (
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => setOpenGroups((prev) => ({ ...prev, [item.key]: !open }))}
          aria-expanded={open}
          className={clsx(
            "ws-nav-link w-full justify-between",
            groupActive && !open && "text-foreground",
          )}>
          <span className="flex items-center gap-3">
            <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
            {item.label[language]}
          </span>
          <ChevronDown
            className={clsx("size-4 transition-transform duration-300", open && "rotate-180")}
          />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden">
              <div className="mt-1 flex flex-col gap-1 border-s border-border ps-2">
                {children.map((child) => (
                  <NavLink key={child.key} item={child} depth={1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );

    // The collapsed rail has no room for a disclosure, so it flattens the group
    // into plain icons. The mobile drawer is never collapsed and keeps the menu.
    if (collapsed) {
      return (
        <>
          <div className="hidden flex-col gap-1 lg:flex">
            {children.map((child) => (
              <NavLink key={child.key} item={child} />
            ))}
          </div>
          <div className="lg:hidden">{disclosure}</div>
        </>
      );
    }

    return disclosure;
  };

  const panel = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div
        className={clsx(
          "flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-5",
          collapsed && "lg:justify-center lg:px-0",
        )}>
        <a
          href="https://webschema.online"
          target="_blank"
          rel="noreferrer"
          aria-label="Open website"
          className="relative shrink-0">
          <img
            src="/webschema.jpeg"
            alt=""
            className="size-9 rounded-md object-cover ring-1 ring-black/5 dark:ring-white/10"
          />
          <span className="absolute -bottom-0.5 -end-0.5 size-2.5 rounded-full border-2 border-sidebar bg-emerald-500" />
        </a>

        <div className={clsx("min-w-0 flex-1", collapsed && "lg:hidden")}>
          <p className="truncate text-sm font-extrabold tracking-tight">Webschema</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {isRTL ? "لوحة التحكم" : "Admin panel"}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? t.expand : t.collapse}
          aria-label={collapsed ? t.expand : t.collapse}
          className={clsx(
            "hidden size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex",
            collapsed && "lg:hidden",
          )}>
          <PanelLeftClose className={clsx("size-4", isRTL && "rotate-180")} />
        </button>
      </div>

      {/* Sections */}
      <nav className="no-scrollbar flex-1 overflow-y-auto px-4 py-5">
        {collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={t.expand}
            aria-label={t.expand}
            className="mx-auto mb-3 hidden size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex">
            <PanelLeftOpen className={clsx("size-4", isRTL && "rotate-180")} />
          </button>
        )}

        <div className="flex flex-col gap-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.key} className="flex flex-col gap-1">
              <p
                className={clsx(
                  "px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70",
                  collapsed && "lg:hidden",
                )}>
                {section.title[language]}
              </p>

              {section.items.map((item) =>
                item.children?.length ? (
                  <NavGroup key={item.key} item={item} />
                ) : (
                  <NavLink key={item.key} item={item} />
                ),
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Account + logout */}
      <div className="shrink-0 border-t border-sidebar-border p-4">
        <div
          className={clsx(
            "mb-2 flex items-center gap-3 rounded-md bg-muted/60 p-2.5",
            collapsed && "lg:justify-center lg:bg-transparent lg:p-0",
          )}>
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-emphasis text-xs font-black text-emphasis-foreground">
            {initials}
          </div>
          <div className={clsx("min-w-0 flex-1", collapsed && "lg:hidden")}>
            <p className="truncate text-sm font-bold">{adminUserInfo?.name || "—"}</p>
            <p className="truncate text-[11px] text-muted-foreground">{adminUserInfo?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loadingLogout}
          title={collapsed ? t.logout : undefined}
          className={clsx(
            "inline-flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-[0.98]",
            "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
            "dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20",
            "disabled:pointer-events-none disabled:opacity-55",
            collapsed && "lg:px-0",
          )}>
          {loadingLogout ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4 shrink-0" />
          )}
          <span className={clsx(collapsed && "lg:hidden")}>
            {loadingLogout ? t.loggingOut : t.logout}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside
        className="fixed inset-y-0 start-0 z-30 hidden w-[var(--sidebar-w)] border-e border-sidebar-border transition-[width] duration-300 ease-out lg:block"
        aria-label="Sidebar">
        {panel}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: isRTL ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "100%" : "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 start-0 z-50 w-[17rem] max-w-[85vw] border-e border-sidebar-border shadow-2xl"
              aria-label="Sidebar">
              {panel}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SideMenu;
