import { useState, useContext, useEffect } from "react";
import { EyeOff, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../../redux/queries/userApi";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../redux/slices/authSlice";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";
import { StoreContext } from "../../StorenameContext";
import { clsx } from "clsx";

function Login() {
  const storeName = useContext(StoreContext);

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        return toast.error("All fields are required");
      }

      const res: any = await loginUser({ email, password }).unwrap();

      dispatch(setUserInfo({ ...res }));
      navigate("/admin");
    } catch (error: any) {
      if (error?.status === "FETCH_ERROR") {
        toast.error("Server is down. Please try again later.");
      } else {
        toast.error(error?.data?.message || "Login failed.");
      }
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden"; // disable scroll
    return () => {
      document.body.style.overflow = "auto"; // enable scroll when component unmounts
    };
  }, []);
  return (
    <>
      <div className=" flex flex-col items-center justify-center  bg-gradient-to-br from-blue-50 via-white to-blue-50  h-[600px]  lg:min-h-screen   text-black">
        <div>
          <h1 className="mb-5 text-2xl font-semibold">Login to {storeName}</h1>
        </div>
        <div className="">
          <form onSubmit={handleLogin}>
            <div className=" h-[40px] bg-opacity-50 w-[300px] rounded-md   bg-gray-100  placeholder:text-grey-40  flex items-center mb-4">
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className=" w-full border rounded-md h-full bg-gray-100 bg-opacity-50 py-3 px-4  outline-0  focus:border-blue-500 focus:border-2 "
              />
            </div>
            <div className="rounded-md border relative  h-[40px]  w-[300px]   bg-gray-100  placeholder:text-grey-40  flex items-center mb-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full  rounded-md h-full bg-gray-100 bg-opacity-50 py-3 px-4 outline-none outline-0 focus:border-blue-500 focus:border-2"
              />
              <button
                type="button"
                className="text-gray-500 absolute right-0 focus:text-violet-60 px-4 focus:outline-none"
                onClick={togglePasswordVisibility}>
                {showPassword ? (
                  <Eye strokeWidth={1} />
                ) : (
                  <span>
                    <EyeOff strokeWidth={1} />
                  </span>
                )}
              </button>
            </div>
            <div className="flex justify-center">
              <button
                disabled={isLoading}
                type="submit"
                className={clsx(
                  "w-full cursor-pointer mt-4 border rounded-lg font-semibold flex items-center justify-center  px-3 py-2  transition-all duration-300  shadow-md text-white ",
                  isLoading
                    ? "bg-gray-200"
                    : "bg-gradient-to-t from-slate-800 to-slate-600 hover:bg-gradient-to-t hover:from-slate-800 hover:to-slate-700/80"
                )}>
                {isLoading ? <Spinner className="!border-t-black" /> : "Log in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
