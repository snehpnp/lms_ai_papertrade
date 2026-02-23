import React, { createContext, useContext, useState, useCallback } from "react";

type Role = "admin" | "subadmin" | "student";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("trading_lms_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, _password: string) => {
    // Mock login - replace with API call
    const role: Role = email.includes("subadmin")
      ? "subadmin"
      : email.includes("student") || email.includes("user")
      ? "student"
      : "admin";
    const mockUser: User = {
      id: "1",
      name: role === "admin" ? "Admin User" : role === "subadmin" ? "SubAdmin User" : "Student User",
      email,
      role,
    };
    localStorage.setItem("trading_lms_user", JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("trading_lms_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
