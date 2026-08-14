import { useState, useContext, useEffect, useMemo } from "react";
import { EyeOff, Eye, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginUserMutation } from "../../redux/queries/userApi";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../redux/slices/authSlice";
import { toast } from "react-toastify";
import { StoreContext } from "../../StorenameContext";
import { clsx } from "clsx";
import { validateLogin } from "../../validation/userSchema";

// ✅ Keep ONLY ONE image (from /public)
const leftImage = "/login-img.jpg";

function Login() {
  const storeName = useContext(StoreContext);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  // ✅ Tips (rotate on the image)
  const tips = useMemo(
    () => [
      "Tip: Review today’s orders and pending shipments after logging in.",
      "Tip: Keep product stock updated to avoid overselling.",
      "Tip: Check abandoned carts to recover lost sales.",
      "Tip: Monitor daily revenue and conversion rates from the dashboard.",
      "Tip: Update banners and offers regularly to boost engagement.",
      "Tip: Respond quickly to customer messages to build trust.",
      "Tip: Schedule discounts during peak traffic hours for better sales.",
      "Tip: Regularly back up your store data for safety.",
    ],
    [],
  );

  const [activeTip, setActiveTip] = useState(0);
  const [tipAnimKey, setTipAnimKey] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  const handleLogin = async (e: any) => {
    e.preventDefault();

    const result = validateLogin({ email, password });
    if (!result.isValid) return toast.error(Object.values(result.errors)[0]);

    try {
      const res: any = await loginUser(result.data).unwrap();
      dispatch(setUserInfo({ ...res }));
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

  // ✅ Rotate tips only (every 6s)
  useEffect(() => {
    if (!tips.length) return;
    const id = window.setInterval(() => {
      setActiveTip((t) => (t + 1) % tips.length);
      setTipAnimKey((k) => k + 1); // trigger animation
    }, 6000);
    return () => window.clearInterval(id);
  }, [tips]);

  return (
    <div className="h-dvh w-full overflow-hidden bg-background">
      <div className="grid h-full w-full grid-cols-1 md:grid-cols-[1.55fr_1fr]">
        {/* LEFT: ONE IMAGE + TIP OVERLAY */}
        <div className="relative hidden md:block overflow-hidden">
          {/* Image */}
          <img
            src={leftImage}
            alt="Login visual"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/0" />

          {/* Tip on image */}
          <div className="absolute bottom-10 left-10 right-10">
            <div
              key={tipAnimKey}
              className="max-w-xl rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md px-5 py-4 text-white shadow-[0_10px_40px_rgba(0,0,0,0.35)]
                         animate-[tipIn_600ms_ease-out]">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/80">
                Helpful tip
              </div>
              <div className="mt-2 text-lg font-semibold leading-snug">{tips[activeTip]}</div>
            </div>
          </div>

          {/* Keyframes */}
          <style>
            {`
              @keyframes tipIn {
                0% { opacity: 0; transform: translateY(14px); }
                100% { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>
        </div>

        {/* RIGHT: FORM */}
        <div className="flex h-full items-center justify-center overflow-y-auto px-6 py-10 sm:px-8">
          <div className="w-full max-w-md animate-fade-up">
            {/* Brand */}
            <div className="mb-8 flex items-center gap-2.5">
              <img
                src="/webschema.jpeg"
                className="size-9 rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10"
                alt=""
              />
              <span className="text-sm font-extrabold tracking-tight">
                {storeName || "Konekta"}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Login to your account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Welcome back! Enter your details to log in.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              {/* Email */}
              <div>
                <label className="ws-label">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ws-input"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="ws-label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="ws-input pe-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 end-1.5 my-auto grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="size-4 rounded accent-neutral-900 dark:accent-neutral-100"
                  />
                  Remember login
                </label>

                <Link
                  to="/forget-password"
                  className="font-bold text-foreground underline-offset-4 transition-colors hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                disabled={isLoading}
                type="submit"
                className={clsx("ws-btn-primary mt-2 h-12 w-full text-base")}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Login"
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
