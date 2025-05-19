"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to decode JWT
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (error) {
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token: string) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return Date.now() >= decoded.exp * 1000;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem("access_token");
      
      if (storedToken) {
        if (isTokenExpired(storedToken)) {
          logout();
        } else {
          setToken(storedToken);
        }
      }
    };

    // Initial check
    checkAuth();
    
    // Set up periodic checks every minute
    const interval = setInterval(checkAuth, 60000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    router.push("/login");
  };

  const value = {
    isAuthenticated: !!token,
    token,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};