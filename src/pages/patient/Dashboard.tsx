import { NeuroCard } from "@/components/ui/neuro-card";
import {
  Upload,
  Clock,
  MessageCircle,
  Calendar,
  QrCode,
  Activity,
  FileText,
  TrendingUp,
} from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShadButton } from "@/components/ui/shad-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FC } from "react";

interface HealthMetric {
  label: string;
  value: string;
  icon: FC;
  color: string;
  highlight: string;
  link: string;
}

interface VitalHistory {
  date: string;
  value: string;
}

interface VitalTrend {
  label: string;
  current: string;
  trend: "improving" | "stable" | "worsening";
  lastUpdated: string;
  history: VitalHistory[];
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  remaining: number;
}

interface ActivityBase {
  date: string;
  type: "appointment" | "report" | "prescription";
  title: string;
  details: string;
  status: "scheduled" | "completed" | "active";
}

interface AppointmentActivity extends ActivityBase {
  type: "appointment";
  time: string;
}

interface ReportActivity extends ActivityBase {
  type: "report";
  metrics: {
    [key: string]: string;
  };
}

interface PrescriptionActivity extends ActivityBase {
  type: "prescription";
  medications: string[];
}

type RecentActivity = AppointmentActivity | ReportActivity | PrescriptionActivity;

const PatientDashboard: FC = () => {
  const healthMetrics: HealthMetric[] = [
    {
      label: "Next Appointment",
      value: "Oct 25",
      icon: Calendar,
      color: "#4F46E5",
      highlight: "Dr. Sharma",
      link: "/patient/appointments",
    },
    {
      label: "Active Prescriptions",
      value: "2",
      icon: FileText,
      color: "#34D399",
      highlight: "View Details",
      link: "/patient/prescriptions",
    },
    {
      label: "Recent Reports",
      value: "3",
      icon: Activity,
      color: "#3B82F6",
      highlight: "All Normal",
      link: "/patient/reports",
    },
    {
      label: "AI Consultations",
      value: "24/7",
      icon: MessageCircle,
      color: "#F59E0B",
      highlight: "Available",
      link: "/patient/ai-chat",
    },
  ];

  const recentActivity: RecentActivity[] = [
    {
      date: "21/10/2025",
      type: "appointment",
      title: "Upcoming Appointment",
      details: "With Dr. Sharma - Cardiology",
      time: "10:30 AM",
      status: "scheduled",
    },
    {
      date: "15/10/2025",
      type: "report",
      title: "Blood Test Results",
      details: "Complete Blood Count",
      status: "completed",
      metrics: {
        hemoglobin: "14.2 g/dL",
        wbc: "7.5k/µL",
        platelets: "250k/µL",
      },
    },
    {
      date: "10/10/2025",
      type: "prescription",
      title: "Prescription Updated",
      details: "By Dr. Kumar - General Medicine",
      status: "active",
      medications: ["Metformin 500mg", "Aspirin 75mg"],
    },
  ];

  const vitalTrends: VitalTrend[] = [
    {
      label: "Blood Pressure",
      current: "120/80",
      trend: "stable",
      lastUpdated: "Today",
      history: [
        { date: "Oct 21", value: "120/80" },
        { date: "Oct 14", value: "118/79" },
        { date: "Oct 7", value: "122/82" },
      ],
    },
    {
      label: "Blood Sugar",
      current: "98 mg/dL",
      trend: "improving",
      lastUpdated: "2 days ago",
      history: [
        { date: "Oct 19", value: "98" },
        { date: "Oct 12", value: "102" },
        { date: "Oct 5", value: "105" },
      ],
    },
    {
      label: "Weight",
      current: "68 kg",
      trend: "stable",
      lastUpdated: "1 week ago",
      history: [
        { date: "Oct 14", value: "68" },
        { date: "Oct 7", value: "68.5" },
        { date: "Sep 30", value: "69" },
      ],
    },
  ];

  const upcomingMedications: Medication[] = [
    {
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      timing: "After meals",
      remaining: 15,
    },
    {
      name: "Aspirin",
      dosage: "75mg",
      frequency: "Once daily",
      timing: "Morning",
      remaining: 20,
    },
  ];

  const quickActions = [
    {
      label: "Upload Reports",
      icon: Upload,
      color: "#4F46E5",
    },
    {
      label: "Book Appointment",
      icon: Calendar,
      color: "#34D399",
    },
    {
      label: "AI Chat",
      icon: MessageCircle,
      color: "#F59E0B",
    },
    {
      label: "Emergency QR",
      icon: QrCode,
      color: "#3B82F6",
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">
            Welcome Back! <span className="wave-emoji">👋</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Here's your health overview for{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/patient/emergency-qr">
            <ShadButton variant="outline" className="gap-2">
              <QrCode className="h-4 w-4" />
              Emergency QR
            </ShadButton>
          </Link>

        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {quickActions.map((action, idx) => {
            const paths = [
              "/patient/upload-reports",
              "/patient/appointments",
              "/patient/ai-chat",
              "/patient/emergency-qr",
            ];
            return (
              <Link key={idx} to={paths[idx]}>
                <NeuroCard
                  topBorderColor={action.color}
                  className="group cursor-pointer space-y-3 text-center hover:translate-y-[-4px]"
                >
                  <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${action.color}20` }}
                  >
                    <action.icon className="h-6 w-6" style={{ color: action.color }} />
                  </div>
                  <div className="text-sm font-medium">{action.label}</div>
                </NeuroCard>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <NeuroCard topBorderColor="#3B82F6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Total Reports</p>
              <p className="text-3xl font-bold">24</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-accent">
                <TrendingUp className="h-3 w-3" />
                +3 this month
              </p>
            </div>
            <FileText className="h-12 w-12 text-primary opacity-20" />
          </div>
        </NeuroCard>

        <NeuroCard topBorderColor="#34D399">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Appointments</p>
              <p className="text-3xl font-bold">8</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-accent">
                <Clock className="h-3 w-3" />2 upcoming
              </p>
            </div>
            <Calendar className="h-12 w-12 text-accent opacity-20" />
          </div>
        </NeuroCard>

        <NeuroCard topBorderColor="#4F46E5">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Health Score</p>
              <p className="text-3xl font-bold">85%</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-accent">
                <Activity className="h-3 w-3" />
                Good condition
              </p>
            </div>
            <Activity className="h-12 w-12 text-primary opacity-20" />
          </div>
        </NeuroCard>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent Activity</h2>
          <button className="text-sm text-primary hover:underline">View All</button>
        </div>
        <NeuroCard>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      activity.type === "appointment"
                        ? "bg-primary"
                        : activity.type === "report"
                          ? "bg-[#34D399]"
                          : "bg-[#F59E0B]"
                    }`}
                  />
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                      {activity.type === "appointment" && (
                        <p className="text-sm text-muted-foreground">• {activity.time}</p>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    activity.status === "scheduled"
                      ? "bg-primary/10 text-primary"
                      : activity.status === "completed"
                        ? "bg-[#34D399]/10 text-[#34D399]"
                        : "bg-[#F59E0B]/10 text-[#F59E0B]"
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </NeuroCard>
      </div>

      {/* AI Assistant Promo */}
      <NeuroCard className="bg-gradient-primary !text-white">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Try Our AI Health Assistant</h3>
            <p className="opacity-90">Get instant answers about your reports and health queries</p>
          </div>
          <AnimatedButton
            className="shrink-0 bg-white !text-primary hover:bg-opacity-90"
            variant="gradient"
            size="md"
          >
            Chat Now
          </AnimatedButton>
        </div>
      </NeuroCard>
    </div>
  );
};

export default PatientDashboard;
