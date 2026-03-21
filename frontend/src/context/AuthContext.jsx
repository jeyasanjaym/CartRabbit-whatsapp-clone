import { createContext, useContext, useMemo, useState } from "react";
import { clearStoredUser, getStoredUser, setStoredUser } from "../lib/storage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const value = useMemo(
    () => ({
      user,
      login(nextUser) {
        setStoredUser(nextUser);
        setUser(nextUser);
      },
      logout() {
        clearStoredUser();
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
