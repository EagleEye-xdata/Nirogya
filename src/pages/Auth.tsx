import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { NeuroCard } from "@/components/ui/neuro-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { ShadButton } from "@/components/ui/shad-button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Stethoscope, User, Loader2 } from "lucide-react";
import logo from "@/assets/nirogya-logo.png";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  interface LocationState {
    from?: { pathname: string };
  }
  const { login, signup } = useAuth();
  const from =
    (location.state as LocationState)?.from?.pathname || `/${role}/dashboard`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && !formData.name) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success("Welcome back!");
      } else {
        await signup({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role,
        });
        toast.success("Account created successfully!");
      }

      // Navigate to the protected route or dashboard
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <img src={logo} alt="HealthApp" className="h-12 w-12" />
          <span className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            HealthApp
          </span>
        </Link>

        <NeuroCard className="space-y-6">
          {/* Toggle Login/Signup */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? "Sign in to continue"
                : "Start your healthcare journey"}
            </p>
          </div>

          {/* Role Selection (only for signup) */}
          {!isLogin && (
            <div className="space-y-3">
              <label className="text-sm font-medium">I am a:</label>
              <div className="grid grid-cols-2 gap-4">
                <ShadButton
                  type="button"
                  onClick={() => setRole("patient")}
                  variant={role === "patient" ? "primary" : "outline"}
                >
                  <User className="h-6 w-6 mx-auto mb-2 text-white" />
                  <div className="font-medium">Patient</div>
                </ShadButton>
                <ShadButton
                  type="button"
                  onClick={() => setRole("doctor")}
                  variant={role === "doctor" ? "primary" : "outline"}
                >
                  <Stethoscope className="h-6 w-6 mx-auto mb-2 text-white" />
                  <div className="font-medium">Doctor</div>
                </ShadButton>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <FloatingInput
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required={!isLogin}
                />
                <FloatingInput
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="10-digit number"
                />
              </>
            )}

            <FloatingInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            <FloatingInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />

            {isLogin && (
              <div className="text-right">
                <ShadButton variant="ghost" size="sm" className="text-sm">
                  Forgot Password?
                </ShadButton>
              </div>
            )}

            <AnimatedButton
              type="submit"
              className="w-full"
              variant="gradient"
              size="md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </AnimatedButton>
          </form>

          {/* Toggle between login and signup */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <ShadButton
              variant="ghost"
              size="sm"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </ShadButton>
          </div>
        </NeuroCard>

        {/* Terms */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;
