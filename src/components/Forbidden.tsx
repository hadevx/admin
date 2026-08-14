// pages/Forbidden.tsx
import { useNavigate, useSearchParams } from "react-router-dom";
import { LogOut, RefreshCcw, ShieldAlert } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useLogoutMutation } from "../redux/queries/userApi";
import { toast } from "react-toastify";

export default function Forbidden() {
  const dispatch = useDispatch();
  const [logoutApiCall] = useLogoutMutation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const from = params.get("from");

  const handleLogout = async () => {
    try {
      await logoutApiCall(undefined).unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error: any) {
      toast.error(error?.data?.message || "Logout failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="ws-card w-full max-w-md animate-fade-up p-6 text-center sm:p-8">
        {/* Icon */}
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 dark:border-rose-500/25 dark:bg-rose-500/10">
          <ShieldAlert className="size-7 text-rose-600 dark:text-rose-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold tracking-tight">403 – Access Denied</h1>

        {/* Description */}
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          You’re logged in, but you don’t have permission to access this page.
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {from && (
            <button onClick={() => navigate(from)} className="ws-btn-secondary flex-1">
              <RefreshCcw className="size-4" />
              Retry
            </button>
          )}

          <button onClick={handleLogout} className="ws-btn-primary flex-1">
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
