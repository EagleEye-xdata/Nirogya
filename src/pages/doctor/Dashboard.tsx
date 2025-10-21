import { NeuroCard } from "@/components/ui/neuro-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShadButton } from "@/components/ui/shad-button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  FileText,
  ChevronRight,
  Brain,
  ClipboardList,
  MoreVertical,
  Mic,
  Clock,
  IndianRupee,
  Activity,
  Stethoscope,
  Bell,
  Plus,
  Search,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { FC } from "react";

interface UpcomingAppointment {
  time: string;
  patient: string;
  type: string;
  status: "confirmed" | "pending" | "cancelled";
  avatar: string;
  condition: string;
  duration: string;
}

interface PatientStats {
  bp: string;
  glucose: string;
  weight: string;
}

interface RecentPatient {
  name: string;
  lastVisit: string;
  condition: string;
  nextAppointment: string;
  avatar: string;
  stats: PatientStats;
}

interface Notification {
  type: "appointment" | "ai-analysis" | "report";
  message: string;
  time: string;
  action: string;
}

interface DashboardStat {
  label: string;
  value: string;
  icon: typeof Users;
  color: string;
  link: string;
  change?: string;
}

const DoctorDashboard: FC = () => {
  // Data
  const upcomingAppointments: UpcomingAppointment[] = [
    {
      time: "10:00 AM",
      patient: "Rajesh Kumar",
      type: "Follow-up",
      status: "confirmed",
      avatar: "RK",
      condition: "Diabetes Review",
      duration: "30 min",
    },
    {
      time: "11:30 AM",
      patient: "Priya Sharma",
      type: "New Patient",
      status: "confirmed",
      avatar: "PS",
      condition: "Initial Consultation",
      duration: "45 min",
    },
    {
      time: "02:00 PM",
      patient: "Amit Patel",
      type: "Consultation",
      status: "pending",
      avatar: "AP",
      condition: "Blood Pressure Check",
      duration: "30 min",
    },
  ];

  const recentPatients: RecentPatient[] = [
    {
      name: "Meera Singh",
      lastVisit: "2 days ago",
      condition: "Stable",
      nextAppointment: "28 Oct",
      avatar: "MS",
      stats: { bp: "120/80", glucose: "98", weight: "65kg" },
    },
    {
      name: "Vikram Malhotra",
      lastVisit: "5 days ago",
      condition: "Improving",
      nextAppointment: "1 Nov",
      avatar: "VM",
      stats: { bp: "130/85", glucose: "110", weight: "72kg" },
    },
    {
      name: "Anita Desai",
      lastVisit: "1 week ago",
      condition: "Needs Review",
      nextAppointment: "25 Oct",
      avatar: "AD",
      stats: { bp: "140/90", glucose: "125", weight: "58kg" },
    },
  ];

  const notifications: Notification[] = [
    {
      type: "appointment",
      message: "New appointment request from Rahul Verma",
      time: "5 min ago",
      action: "Review",
    },
    {
      type: "ai-analysis",
      message: "AI Analysis complete for Patient #1234",
      time: "15 min ago",
      action: "View",
    },
    {
      type: "report",
      message: "Lab results available for Priya Sharma",
      time: "1 hour ago",
      action: "Check",
    },
  ];

  const todayStats: DashboardStat[] = [
    {
      label: "Appointments",
      value: "8/10",
      icon: Calendar,
      color: "#4F46E5",
      link: "/doctor/appointments",
      change: "+2",
    },
    {
      label: "AI Transcriptions",
      value: "6/8",
      icon: Brain,
      color: "#F59E0B",
      link: "/doctor/ai-scribe",
      change: "+1",
    },
    {
      label: "Prescriptions",
      value: "12/15",
      icon: FileText,
      color: "#34D399",
      link: "/doctor/prescriptions",
      change: "+3",
    },
    {
      label: "Patient Reviews",
      value: "4/5",
      icon: ClipboardList,
      color: "#3B82F6",
      link: "/doctor/reviews",
      change: "+1",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Good Morning, Dr. Smith 👨‍⚕️
          </h1>
          <p className="text-xl text-muted-foreground">
            Tuesday, 21 October 2025
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-white rounded-full flex items-center justify-center">
              3
            </span>
          </div>
          <Avatar className="h-12 w-12">
            <AvatarFallback>DS</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {todayStats.map((stat, idx) => (
          <Link to={stat.link} key={idx}>
            <NeuroCard topBorderColor={stat.color}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <stat.icon
                    className="h-5 w-5"
                    style={{ color: stat.color }}
                  />
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
                {stat.change && (
                  <p className="text-xs text-accent flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change} today
                  </p>
                )}
              </div>
            </NeuroCard>
          </Link>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column - Appointments & Analytics */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6">
            <Tabs defaultValue="upcoming" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="requests">Requests</TabsTrigger>
                </TabsList>
                <div className="relative max-w-xs">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search appointments..."
                    className="pl-9 max-w-xs"
                  />
                </div>
              </div>

              <TabsContent value="upcoming" className="m-0">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {upcomingAppointments.map((apt, idx) => (
                      <Card key={idx} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>{apt.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{apt.patient}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {apt.time} · {apt.duration}
                              </div>
                              <Badge
                                variant={
                                  apt.status === "confirmed"
                                    ? "default"
                                    : "secondary"
                                }
                                className="mt-2"
                              >
                                {apt.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                apt.status === "confirmed"
                                  ? "outline"
                                  : "secondary"
                              }
                            >
                              {apt.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              {apt.condition}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Your Analytics</h3>
              <ShadButton variant="outline" size="sm">
                View Report
                <ArrowRight className="ml-2 h-4 w-4" />
              </ShadButton>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  label: "Avg. Consultation Time",
                  value: "25 min",
                  change: "-2 min",
                },
                { label: "Patient Satisfaction", value: "96%", change: "+2%" },
                { label: "AI Assistance Usage", value: "85%", change: "+5%" },
                { label: "Follow-up Rate", value: "78%", change: "+3%" },
              ].map((stat, idx) => (
                <Card key={idx} className="p-4">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <span className="text-xs text-green-500">
                      {stat.change}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Patient Overview & Notifications */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Patients</h3>
              <Link to="/doctor/patients">
                <ShadButton variant="ghost" size="sm">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </ShadButton>
              </Link>
            </div>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {recentPatients.map((patient, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{patient.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{patient.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Next: {patient.nextAppointment}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          patient.condition === "Stable"
                            ? "outline"
                            : patient.condition === "Improving"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {patient.condition}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="text-center p-2 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">BP</p>
                        <p className="text-sm font-medium">
                          {patient.stats.bp}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Glucose</p>
                        <p className="text-sm font-medium">
                          {patient.stats.glucose}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Weight</p>
                        <p className="text-sm font-medium">
                          {patient.stats.weight}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Activity Feed</h3>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {notifications.map((notif, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        notif.type === "appointment"
                          ? "bg-primary/10 text-primary"
                          : notif.type === "ai-analysis"
                          ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                          : "bg-[#34D399]/10 text-[#34D399]"
                      }`}
                    >
                      {notif.type === "appointment" ? (
                        <Calendar className="h-4 w-4" />
                      ) : notif.type === "ai-analysis" ? (
                        <Brain className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notif.time}
                      </p>
                    </div>
                    <ShadButton variant="ghost" size="sm">
                      {notif.action}
                    </ShadButton>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
