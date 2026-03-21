import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { clearPendingAuth, getPendingAuth } from "../lib/storage.js";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pending = getPendingAuth();
  const navigate = useNavigate();
  const { login } = useAuth();

  if (!pending?.email) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <button className="rounded-lg border border-wa-border px-4 py-2" onClick={() => navigate("/")}>
          Go to login
        </button>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/verify", {
        email: pending.email,
        otp: otp.trim(),
      });
      login(data.user);
      clearPendingAuth();
      navigate("/chat", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-wa-bg px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-wa-border bg-wa-panel p-6">
        <h1 className="mb-2 text-2xl font-semibold">Verify OTP</h1>
        <p className="mb-6 text-sm text-wa-muted">Code sent to {pending.email}</p>
        <input
          className="mb-4 w-full rounded-lg border border-wa-border bg-wa-panelHeader px-3 py-2 tracking-[0.4em] outline-none focus:border-wa-accent"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          placeholder="123456"
        />
        {error ? <p className="mb-2 text-sm text-red-400">{error}</p> : null}
        <button disabled={loading} className="w-full rounded-lg bg-wa-accent py-2 font-semibold text-white">
          {loading ? "Verifying..." : "Verify & Login"}
        </button>
      </form>
    </div>
  );
}
