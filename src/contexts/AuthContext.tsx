import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "patient" | "doctor";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    name: string;
    role: "patient" | "doctor";
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem("auth_token");
    if (token) {
      // TODO: Validate token with backend
      // For now, simulate stored user data
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // Simulated login for demonstration
      if (email && password) {
        const mockUser = {
          id: "1",
          name: email.split("@")[0],
          email,
          role: email.includes("doctor")
            ? "doctor"
            : ("patient" as "patient" | "doctor"),
        };

        localStorage.setItem("auth_token", "mock_token");
        localStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: {
    email: string;
    password: string;
    name: string;
    role: "patient" | "doctor";
  }) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // Simulated signup for demonstration
      const mockUser = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        role: data.role,
      };

      localStorage.setItem("auth_token", "mock_token");
      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
