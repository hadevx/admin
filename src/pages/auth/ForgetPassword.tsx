import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Mail, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const { data } = await axios.post(
        "https://backend.webschema.online/api/users/forget-password",
        { email },
      );
      setMessage(data.message || "Reset link sent. Please check your email.");
      setIsError(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error sending reset link";
      setMessage(msg);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md animate-fade-up">
        {/* Header */}
        <div className="mb-5">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            Back to Login
          </Link>
        </div>

        <div className="ws-card overflow-hidden">
          {/* Top band */}
          <div className="border-b border-border p-6">
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emphasis text-emphasis-foreground">
                <ShieldCheck className="size-5" />
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-extrabold tracking-tight">Reset your password</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your email and we’ll send you a secure reset link.
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="ws-tile">
                <label className="ws-label">Email</label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute inset-y-0 start-3.5 my-auto size-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="ws-input ps-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <p className="mt-2 text-[11px] text-muted-foreground">
                  If the email exists, you’ll receive a link within a few minutes.
                </p>
              </div>

              <button disabled={loading} className="ws-btn-primary w-full py-3">
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            {/* Message */}
            {message ? (
              <div
                className={`mt-4 rounded-xl border p-4 text-sm font-semibold ${
                  isError
                    ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
                }`}>
                {message}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-[var(--surface-muted)] px-6 py-5">
            <p className="text-xs text-muted-foreground">
              Didn’t get the email? Check spam/junk or try again with the correct address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
