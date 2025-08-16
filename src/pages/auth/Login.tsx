import { useState, useContext, useEffect } from "react";
import { EyeOff, Eye } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginUserMutation } from "../../redux/queries/userApi";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../redux/slices/authSlice";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";
import { StoreContext } from "../../StorenameContext";
import { clsx } from "clsx";
import { validateLogin } from "../../validation/userSchema";

function Login() {
  const storeName = useContext(StoreContext);

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    const result = validateLogin({ email, password });

    if (!result.isValid) {
      return toast.error(Object.values(result.errors)[0]);
    }
    try {
      if (!email || !password) {
        return toast.error("All fields are required");
      }

      const res: any = await loginUser(result.data).unwrap();
      dispatch(setUserInfo({ ...res }));
      setPassword("");
      setEmail("");
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
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen text-black">
      <h1 className="mb-5 text-2xl font-semibold">Login to {storeName}</h1>
      <form onSubmit={handleLogin} className="w-[300px]">
        {/* Email */}
        <div className="h-[40px] bg-opacity-50 rounded-md bg-gray-100 flex items-center mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md h-full bg-gray-100 py-3 px-4 outline-0 focus:border-blue-500 focus:border-2"
          />
        </div>

        {/* Password */}
        <div className="rounded-md border relative h-[40px] bg-gray-100 flex items-center mb-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md h-full bg-gray-100 py-3 px-4 outline-none focus:border-blue-500 focus:border-2"
          />
          <button
            type="button"
            className="text-gray-500 absolute right-0 px-4 focus:outline-none"
            onClick={togglePasswordVisibility}>
            {showPassword ? <Eye strokeWidth={1} /> : <EyeOff strokeWidth={1} />}
          </button>
        </div>

        {/* Forgot Password Link */}
        <div className="text-left mb-4">
          <Link to="/admin/forget-password" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          disabled={isLoading}
          type="submit"
          className={clsx(
            "w-full cursor-pointer mt-2 border rounded-lg font-semibold flex items-center justify-center px-3 py-2 shadow-md text-white transition-all duration-300",
            isLoading
              ? "bg-gray-200"
              : "bg-gradient-to-t from-slate-800 to-slate-600 hover:from-slate-800 hover:to-slate-700/80"
          )}>
          {isLoading ? <Spinner className="!border-t-black" /> : "Log in"}
        </button>
      </form>
    </div>
  );
}

export default Login;
