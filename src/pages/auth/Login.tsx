import { useState, useContext, useEffect } from "react";
import { EyeOff, Eye, Store, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginUserMutation } from "../../redux/queries/userApi";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../redux/slices/authSlice";
import { toast } from "react-toastify";
// import Spinner from "../../components/Spinner";
import { StoreContext } from "../../StorenameContext";
import { clsx } from "clsx";
import { validateLogin } from "../../validation/userSchema";

function Login() {
  const storeName = useContext(StoreContext);

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const handleLogin = async (e: any) => {
    e.preventDefault();

    const result = validateLogin({ email, password });
    if (!result.isValid) return toast.error(Object.values(result.errors)[0]);

    try {
      if (!email || !password) return toast.error("All fields are required");

      const res: any = await loginUser(result.data).unwrap();
      dispatch(setUserInfo({ ...res }));
      setPassword("");
      setEmail("");
      navigate("/admin");
    } catch (error: any) {
      if (error?.status === "FETCH_ERROR") toast.error("Server is down. Please try again later.");
      else toast.error(error?.data?.message || "Login failed.");
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-black/10 bg-white/80 backdrop-blur shadow-sm overflow-hidden">
          {/* Top band (match ForgotPassword) */}
          <div className="p-6 border-b border-black/10 bg-white">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-2xl bg-zinc-900 text-white grid place-items-center shrink-0">
                <Store className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-bold text-zinc-900">{storeName}</h1>
                <p className="text-sm text-zinc-600 mt-1">
                  Sign in to manage your store dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <label className="block text-xs font-semibold text-zinc-600">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-zinc-600">Password</label>

                  <Link
                    to="/forget-password"
                    className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition">
                    Forgot?
                  </Link>
                </div>

                <div className="mt-2 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white px-3 pr-10 py-3 text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 px-3 inline-flex items-center text-zinc-400 hover:text-zinc-700 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                disabled={isLoading}
                type="submit"
                className={clsx(
                  "w-full rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 shadow-lg drop-shadow-[0_0_10px_rgba(24,24,27,0.25)] transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2",
                )}>
                {isLoading ? (
                  <>
                    {/* keep your Spinner if you like; Loader2 matches ForgotPassword */}
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
