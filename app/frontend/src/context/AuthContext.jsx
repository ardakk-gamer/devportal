import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatApiError } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = loading; false = anon; obj = authed
  const [token, setToken] = useState(localStorage.getItem("nova_token") || null);

  const bootstrap = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me", token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      setUser(data);
    } catch {
      setUser(false);
    }
  }, [token]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (username, password) => {
    try {
      const { data } = await api.post("/auth/login", { username, password });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("nova_token", data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatApiError(e) };
    }
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    setUser(false);
    setToken(null);
    localStorage.removeItem("nova_token");
    delete api.defaults.headers.common["Authorization"];
  };

  // ensure token header set on refresh
  useEffect(() => {
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refresh: bootstrap }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
