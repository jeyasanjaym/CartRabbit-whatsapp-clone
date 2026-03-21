import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { setStoredUser } from "../lib/storage.js";
import styles from "./Login.module.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const name = username.trim();
    if (!name) {
      setError("Enter a username");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/users", { username: name });
      setStoredUser(data.user);
      navigate("/chat", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Could not sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden />
          <div>
            <h1 className={styles.title}>WhatsApp Web Clone</h1>
            <p className={styles.sub}>Enter a username to continue. Each name is a unique user.</p>
          </div>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className={styles.input}
            type="text"
            autoComplete="username"
            placeholder="e.g. Sanjay"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={64}
          />
          {error ? <p className={styles.err}>{error}</p> : null}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? "…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
