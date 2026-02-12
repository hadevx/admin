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
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 shadow bg-white  p-6 text-center">
        {/* Icon */}
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
          <ShieldAlert className="h-7 w-7 text-rose-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-neutral-950">403 – Access Denied</h1>

        {/* Description */}
        <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
          You’re logged in, but you don’t have permission to access this page.
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {from && (
            <button
              onClick={() => navigate(from)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition">
              <RefreshCcw className="h-4 w-4" />
              Retry
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-900 transition">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
