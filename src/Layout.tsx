/* import SideMenu from "./components/SideMenu";
import { ToastContainer } from "react-toastify"; */
import "react-toastify/dist/ReactToastify.css";
import SideMenu2 from "./components/SideMenu2";
/* import type { RootState } from "./redux/store";
import { useSelector } from "react-redux"; */
// import { toggleLang } from "./redux/slices/languageSlice";

function Layout({ children }: { children: React.ReactNode }) {
  // const dispatch = useDispatch();
  // const lang = useSelector((state: RootState) => state.language.lang);

  return (
    <div className="flex  lg:gap-5 font-[Manrope] bg-zinc-200/40 transition-all duration-500 ease-in-out">
      <SideMenu2 />
      {children}
    </div>
  );
}
/* bg-zinc-200/30  */
export default Layout;
