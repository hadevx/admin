import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, Languages, Menu, Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { toggleLang } from "@/redux/slices/languageSlice";
import { toggleTheme } from "@/redux/slices/themeSlice";
import type { RootState } from "@/redux/store";
import { DETAIL_LABEL, findActiveLeaf, type Lang } from "@/lib/nav";

type TopbarProps = {
  onOpenMobileMenu: () => void;
};

function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const language: Lang = useSelector((state: any) => state.language.lang);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isRTL = language === "ar";
  const isDark = theme === "dark";

  const leaf = findActiveLeaf(pathname);
  const title = leaf?.label[language] ?? (isRTL ? "لوحة التحكم" : "Dashboard");
  // `/orders/abc123` is a detail view of `/orders` — show it as a crumb.
  const isDetail = !!leaf && pathname !== leaf.to;

  return (
    <header className="no-print sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="ws-shell-x mx-auto flex h-16 w-full max-w-[1600px] items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label={isRTL ? "فتح القائمة" : "Open menu"}
          className="ws-icon-btn lg:hidden">
          <Menu className="size-5" />
        </button>

        <div className="min-w-0 flex-1">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            {isDetail && leaf ? (
              <>
                <Link to={leaf.to} className="truncate transition-colors hover:text-foreground">
                  {leaf.label[language]}
                </Link>
                <ChevronRight className={clsx("size-3 shrink-0", isRTL && "rotate-180")} />
                <span className="truncate">{DETAIL_LABEL[language]}</span>
              </>
            ) : (
              <span className="truncate">{isRTL ? "لوحة التحكم" : "Admin panel"}</span>
            )}
          </nav>
          <h1 className="truncate text-base font-extrabold tracking-tight sm:text-lg">
            {isDetail ? DETAIL_LABEL[language] : title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(toggleLang())}
            title={language === "en" ? "التبديل إلى العربية" : "Switch to English"}
            className="ws-chip h-10 gap-2 px-3">
            <Languages className="size-4" />
            <span className="hidden sm:inline">{language === "en" ? "العربية" : "English"}</span>
            <span className="sm:hidden">{language === "en" ? "ع" : "EN"}</span>
          </button>

          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            title={isDark ? (isRTL ? "الوضع الفاتح" : "Light mode") : isRTL ? "الوضع الداكن" : "Dark mode"}
            className="ws-icon-btn relative overflow-hidden">
            <Sun
              className={clsx(
                "absolute size-5 transition-all duration-300",
                isDark ? "translate-y-8 rotate-90 opacity-0" : "translate-y-0 rotate-0 opacity-100",
              )}
            />
            <Moon
              className={clsx(
                "absolute size-5 transition-all duration-300",
                isDark ? "translate-y-0 rotate-0 opacity-100" : "-translate-y-8 -rotate-90 opacity-0",
              )}
            />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
