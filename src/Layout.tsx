import "react-toastify/dist/ReactToastify.css";
import SideMenu from "./components/SideMenu";
import { useSelector } from "react-redux";
import ThemeToggle from "@/components/ThemeToggle";
function Layout({ children }: { children: React.ReactNode }) {
  const lang = useSelector((state: any) => state.language.lang);

  if (lang === "en") {
    return (
      <div className="flex  lg:gap-5 dark:bg-neutral-950 font-[Manrope] bg-zinc-100 transition-all duration-500 ease-in-out">
        <SideMenu />
        {children}
      </div>
    );
  }
  if (lang === "ar") {
    return (
      <div className="flex   lg:gap-5  bg-zinc-100 dark:bg-neutral-950 transition-all duration-500 ease-in-out">
        <SideMenu />
        {/* <ThemeToggle /> */}
        {children}
      </div>
    );
  }
}

export default Layout;
