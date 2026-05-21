import { createContext, useContext, useEffect, useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import api from "../api/api";
import { auth, googleProvider } from "../firebase/firebase.config";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const registerUser = async (userData) => {
    const res = await api.post("/api/auth/register", userData);
    return res.data;
  };

  const loginUser = async (userData) => {
    const res = await api.post("/api/auth/login", userData);

    if (res.data?.success) {
      setUser(res.data.user);
    }

    return res.data;
  };

  const googleLogin = async () => {
    const firebaseResult = await signInWithPopup(auth, googleProvider);
    const googleUser = firebaseResult.user;

    const res = await api.post("/api/auth/google-login", {
      name: googleUser.displayName,
      email: googleUser.email,
      photoURL: googleUser.photoURL,
    });

    if (res.data?.success) {
      setUser(res.data.user);
    }

    return res.data;
  };

  const logoutUser = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Backend logout error:", error);
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase logout error:", error);
    }

    setUser(null);
  };

  const checkCurrentUser = async () => {
    try {
      setAuthLoading(true);

      const res = await api.get("/api/auth/me");

      if (res.data?.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const authInfo = {
    user,
    setUser,
    authLoading,
    registerUser,
    loginUser,
    googleLogin,
    logoutUser,
    checkCurrentUser,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};