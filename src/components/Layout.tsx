import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Upload,
  Clock,
  MessageCircle,
  QrCode,
  Mic,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown";
import { NavItem, NavGroup } from "./ui/nav-item";
import { Loading } from "./ui/loading";
import { PageTransition } from "./ui/transitions";
import logo from "@/assets/nirogya-logo.png";
import { cn } from "@/lib/utils";
import ProfileModal from "@/components/ProfileModal";

interface LayoutProps {
  children: ReactNode;
  role: "patient" | "doctor";
}

const Layout = ({ children, role }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const patientNavItems = [
    {
      path: "/patient/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      path: "/patient/reports",
      icon: Upload,
      label: "Upload Reports",
    },
    {
      path: "/patient/timeline",
      icon: Clock,
      label: "Timeline",
    },
    {
      path: "/patient/ai-chat",
      icon: MessageCircle,
      label: "AI Chat",
    },
    {
      path: "/patient/appointments",
      icon: Calendar,
      label: "Appointments",
    },
    {
      path: "/patient/emergency",
      icon: QrCode,
      label: "Emergency QR",
    },
  ];

  const doctorNavItems = [
    {
      path: "/doctor/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      path: "/doctor/patients",
      icon: Users,
      label: "Patients",
    },
    {
      path: "/doctor/scribe",
      icon: Mic,
      label: "AI Scribe",
    },
    {
      path: "/doctor/prescriptions",
      icon: FileText,
      label: "Prescriptions",
    },
    {
      path: "/doctor/appointments",
      icon: Calendar,
      label: "Appointments",
    },
    {
      path: "/doctor/billing",
      icon: CreditCard,
      label: "Billing",
    },
  ];

  const navItems = role === "patient" ? patientNavItems : doctorNavItems;

  const handleNavigation = (path: string) => {
    setIsLoading(true);
    navigate(path);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    setIsLoading(false);
    navigate("/auth");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card"
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 p-4">
              <img src={logo} alt="Logo" className="h-8 w-8" />
              <span className="bg-gradient-primary bg-clip-text text-xl font-bold text-transparent">
                Nirogya
              </span>
            </div>

            <nav className="flex-1 space-y-4 p-4">
              {navItems.map((item, idx) => (
                <NavItem
                  key={idx}
                  to={item.path}
                  icon={item.icon}
                  label={item.label}
                  disabled={isLoading}
                />
              ))}
            </nav>

            <div className="border-t border-border p-4">
              <NavGroup label="Settings">
                <NavItem to="/settings" icon={Settings} label="Settings" disabled={isLoading} />
                <div
                  onClick={handleLogout}
                  className="relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-destructive transition-colors hover:text-destructive/90"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </div>
              </NavGroup>
            </div>
          </div>
        </motion.aside>

        <div className={cn("flex-1 transition-all duration-300", sidebarOpen ? "ml-64" : "ml-0")}>
          <header className="glass sticky top-0 z-30 border-b border-border">
            <div className="container flex h-16 items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 transition-colors hover:bg-muted"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative rounded-lg p-2 transition-colors hover:bg-muted">
                      <Bell className="h-5 w-5" />
                      <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between p-4">
                      <span className="text-sm font-medium">Notifications</span>
                      <span className="text-xs text-muted-foreground">Mark all as read</span>
                    </div>
                    <DropdownMenuSeparator />
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted">
                      <User className="h-5 w-5" />
                      <span className="text-sm font-medium">{user?.name || "User"}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link to="/profile">
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className={cn("container py-6", isLoading && "opacity-50")}>
            {isLoading ? <Loading /> : children}
          </main>

          {/* Profile modal shown after first login to complete profile */}
          <ProfileModal />
        </div>
      </div>
    </PageTransition>
  );
};

export default Layout;
