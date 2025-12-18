import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    setUser(data.user);
    localStorage.setItem("cinebook_token", data.token);
  };

  const register = async (payload) => {
    const { data } = await api.post("/api/auth/register", payload);
    setUser(data.user);
    localStorage.setItem("cinebook_token", data.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cinebook_token");
  };

  useEffect(() => {
    const token = localStorage.getItem("cinebook_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/api/auth/profile")
      .then((res) => setUser(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
