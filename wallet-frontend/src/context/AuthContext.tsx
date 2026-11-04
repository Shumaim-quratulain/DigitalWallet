import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import type { AuthContextType, UserData, DecodedToken } from "@/types";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const storedUser = localStorage.getItem("bankapp_user");
      if (!storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const userData: UserData = JSON.parse(storedUser);

        await axios.post("/api/v1/auth/validateToken", {
          token: userData.token,
        });

        setUser(userData);
      } catch (error) {
        console.error("Token validation failed:", error);
        localStorage.removeItem("bankapp_user");
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<UserData> => {
    try {
      const res = await axios.post(
        "/api/v1/auth/login",
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const token = res.data.token;

      //Decoding the username from the token
      const decoded: DecodedToken = jwtDecode(token);
      const extracted_username = decoded.username || decoded.sub || "";

      const userData: UserData = {
        token: res.data.token,
        username: extracted_username,
      };

      localStorage.setItem("bankapp_user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Login failed";
        if (error.response?.status === 401) {
          throw new Error("Invalid username or password");
        }
        throw new Error(errorMessage);
      }
      throw new Error("Network error occurred");
    }
  };

  const signup = async (
    username: string,
    email: string,
    password: string,
    phone: string
  ) => {
    try {
      const res = await axios.post("/api/v1/auth/signup", {
        username,
        email,
        password,
        phone,
      });

      console.log(res.data.message);
      return res.data.message;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Signup failed. Please try again.";
        if (error.response?.status === 409) {
          throw new Error("Username, email or phone number already exists");
        }
        throw new Error(errorMessage);
      }
      throw new Error("Network error occurred");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bankapp_user");
    // Optional: Call backend logout endpoint if needed
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
