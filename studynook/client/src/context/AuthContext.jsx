import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await api.get("/api/auth/me");

      if (res.data?.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const registerUser = async (userData) => {
    const res = await api.post("/api/auth/register", userData);
    return res.data;
  };

  const loginUser = async (loginData) => {
    const res = await api.post("/api/auth/login", loginData);

    if (res.data?.success) {
      setUser(res.data.user);
    }

    return res.data;
  };

  const logoutUser = async () => {
    const res = await api.post("/api/auth/logout");
    setUser(null);
    return res.data;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const authInfo = {
    user,
    setUser,
    authLoading,
    registerUser,
    loginUser,
    logoutUser,
    checkAuth,
  };

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};