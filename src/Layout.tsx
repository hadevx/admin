import "react-toastify/dist/ReactToastify.css";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useLocation } from "react-router-dom";
import SideMenu from "./components/SideMenu";
import Topbar from "./components/Topbar";

const COLLAPSE_KEY = "admin:sidebar-collapsed";

const EXPANDED_WIDTH = "17rem";
const COLLAPSED_WIDTH = "5rem";

function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(COLLAPSE_KEY) === "1",
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  // Freeze the page behind the mobile drawer.
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", mobileOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [mobileOpen]);

  // Close the drawer when navigating.
  useEffect(() => setMobileOpen(false), [pathname]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const toggleCollapse = useCallback(() => setCollapsed((v) => !v), []);

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ "--sidebar-w": collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH } as CSSProperties}>
      <SideMenu
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-h-screen flex-col transition-[padding] duration-300 ease-out lg:ps-[var(--sidebar-w)]">
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="ws-shell-x mx-auto w-full max-w-[1600px] flex-1 pb-20 pt-7 sm:pt-9">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
