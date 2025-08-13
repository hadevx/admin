import SideMenu from "./components/SideMenu";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SideMenu2 from "./components/SideMenu2";

function Layout({ children }: { children: React.ReactElement }) {
  const storeName = "Xelectronics";
  return (
    <>
      <div className="flex  lg:gap-5 font-[Manrope] bg-zinc-200/30 transition-all duration-500 ease-in-out">
        <SideMenu2 storeName={storeName} />
        {children}
      </div>
    </>
  );
}

export default Layout;
