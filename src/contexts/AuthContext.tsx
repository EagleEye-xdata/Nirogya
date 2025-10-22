import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "patient" | "doctor";
}

// Profiles
export interface PatientProfile {
  fullName: string;
  phone?: string;
  dob?: string;
  allergies?: string[];
  emergencyContact?: string;
  bloodType?: string;
  address?: string;
  _updatedAt?: string;
}

export interface DoctorProfile {
  fullName: string;
  phone?: string;
  degree?: string;
  licenseNumber?: string;
  specialization?: string;
  clinic?: string;
  yearsExperience?: number;
  acceptingNewPatients?: boolean;
  _updatedAt?: string;
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
  profile: PatientProfile | DoctorProfile | null;
  updateProfile: (p: Partial<PatientProfile> | Partial<DoctorProfile>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

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
  const [profile, setProfile] = useState<PatientProfile | DoctorProfile | null>(null);

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

  // Load profile after user is set
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      const raw = localStorage.getItem(`profile_${user.id}`);
      if (raw) setProfile(JSON.parse(raw));
      else setProfile(null);
    } catch {
      setProfile(null);
    }
  }, [user]);

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
          role: email.includes("doctor") ? "doctor" : ("patient" as "patient" | "doctor"),
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
      // Initialize empty profile marker to prompt completion
      localStorage.removeItem(`profile_${mockUser.id}`);
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
    setProfile(null);
  };

  const updateProfile = (p: Partial<PatientProfile> | Partial<DoctorProfile>) => {
    if (!user) return;
    const key = `profile_${user.id}`;
    const now = new Date().toISOString();
    const merged = { ...(profile || {}), ...p, _updatedAt: now } as PatientProfile | DoctorProfile;
    localStorage.setItem(key, JSON.stringify(merged));
    setProfile(merged);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, signup, logout, profile, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
