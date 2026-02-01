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
    <div className="min-h-screen bg-zinc-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-5">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900 transition">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white/80 backdrop-blur shadow-sm overflow-hidden">
          {/* Top band */}
          <div className="p-6 border-b border-black/10 bg-white">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-2xl bg-zinc-900 text-white grid place-items-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-bold text-zinc-900">Reset your password</h2>
                <p className="text-sm text-zinc-600 mt-1">
                  Enter your email and we’ll send you a secure reset link.
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <label className="block text-xs font-semibold text-zinc-600">Email</label>

                <div className="mt-2 relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-black/10 bg-white px-10 py-3 text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <p className="mt-2 text-[11px] text-zinc-500">
                  If the email exists, you’ll receive a link within a few minutes.
                </p>
              </div>

              <button
                disabled={loading}
                className="w-full rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 shadow-lg drop-shadow-[0_0_10px_rgba(24,24,27,0.25)] transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            {/* Message */}
            {message ? (
              <div
                className={`mt-4 rounded-2xl border p-4 text-sm font-semibold ${
                  isError
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}>
                {message}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-black/10 bg-white">
            <p className="text-xs text-zinc-500">
              Didn’t get the email? Check spam/junk or try again with the correct address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
