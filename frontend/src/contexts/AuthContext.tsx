import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import authService from "@/services/auth.service";
import { getAccessToken } from "@/lib/token";
import { decodeToken } from "@/lib/jwt";
import { toast } from "sonner";

type Role = "admin" | "subadmin" | "user";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const normalizeRole = (role: string): Role => {
  return role.toLowerCase() as Role;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  // 🔥 Auto login on refresh
  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setLoading(false);
      return;
    }

    const decoded = decodeToken(token);

    if (decoded && decoded.exp * 1000 > Date.now()) {
      setUser({
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: normalizeRole(decoded.role),
      });
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }

    setLoading(false);
  }, []);

  // 🔐 Login
  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const response = await authService.login(email, password);

      const decoded = decodeToken(response.accessToken);

      if (!decoded || decoded.exp * 1000 < Date.now()) {
        toast.error("Invalid token");
        throw new Error("Invalid token");
      }

      const loggedUser: User = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: normalizeRole(decoded.role),
      };

      setUser(loggedUser);

      toast.success("Login successful");

      return loggedUser;
    },
    [],
  );

  // 🚪 Logout
  const logout = useCallback(() => {
    authService.logout(); // centralized
    setUser(null);
    toast.success("Logged out");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
