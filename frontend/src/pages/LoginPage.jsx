import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", {
        username: username.trim(),
        password: password.trim(),
      });
      
      login(data.user);
      
      if (data.message.includes("Registration")) {
        setSuccess("Account created successfully!");
      }
      
      navigate("/chat");
    } catch (err) {
      const res = err.response;
      const d = res?.data;
      let apiError = null;
      if (d != null && typeof d === "object") {
        apiError = d.details || d.message || d.error;
        if (!apiError && Object.keys(d).length > 0) {
          try {
            apiError = JSON.stringify(d);
          } catch {
            apiError = null;
          }
        }
      } else if (typeof d === "string" && d.trim()) {
        apiError = d.trim().slice(0, 400);
      }
      const unreachable =
        err.code === "ERR_NETWORK" ||
        err.message === "Network Error" ||
        !res;
      setError(
        apiError ||
          (unreachable
            ? "Cannot reach the API. Start the backend (npm run dev in backend), ensure MongoDB is configured in .env, and open the app at http://localhost:5173"
            : res?.status
              ? res.status === 502
                ? `API proxy (502): backend not running or it crashed. Fix MongoDB Atlas → Network Access (add your IP), restart with "npm run dev" in the backend folder, wait for "MongoDB connected successfully".`
                : `Server error (HTTP ${res.status}). Open the backend terminal: Atlas IP whitelist and MONGODB_URI are the usual causes; copy any stack trace if you need help.`
              : err.message || "Login failed.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-wa-bg via-wa-panel to-black px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-wa-border bg-wa-panel p-6 shadow-2xl">
        <h1 className="mb-1 text-2xl font-semibold">Welcome to WhatsApp</h1>
        <p className="mb-6 text-sm text-wa-muted">
          Enter username and password to continue. New users will be registered automatically.
        </p>
        <div className="mb-4">
          <label className="mb-1 block text-sm text-wa-muted">Username</label>
          <input 
            className="w-full rounded-lg border border-wa-border bg-wa-panelHeader px-3 py-2 outline-none focus:border-wa-accent" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Enter your username"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm text-wa-muted">Password</label>
          <input 
            type="password"
            className="w-full rounded-lg border border-wa-border bg-wa-panelHeader px-3 py-2 outline-none focus:border-wa-accent" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter your password"
          />
        </div>
        {error ? <p className="mb-2 text-sm text-red-400">{error}</p> : null}
        {success ? <p className="mb-2 text-sm text-emerald-400">{success}</p> : null}
        <button 
          disabled={loading} 
          className="w-full rounded-lg bg-wa-accent py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Connecting..." : "Continue"}
        </button>
        <div className="mt-4 text-center">
          <p className="text-xs text-wa-muted">
            New users will be registered automatically
          </p>
        </div>
      </form>
    </div>
  );
}
