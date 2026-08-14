import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { KeyRound, Loader2 } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data } = await axios.post(
        `https://backend.webschema.online/api/users/reset-password/${token}`,
        { password },
      );
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="ws-card w-full max-w-md animate-fade-up p-6 sm:p-8">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-emphasis text-emphasis-foreground">
          <KeyRound className="size-6" />
        </div>

        <h2 className="text-center text-2xl font-extrabold tracking-tight">Reset Password</h2>
        <p className="mx-auto mt-2 mb-6 max-w-sm text-center text-sm text-muted-foreground">
          Enter your new password below to update your account.
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="ws-label">New password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="ws-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button disabled={loading} className="ws-btn-primary w-full py-3">
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 rounded-xl border p-3 text-center text-sm font-semibold ${
              message.toLowerCase().includes("error")
                ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
            }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
