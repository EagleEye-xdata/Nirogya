import { NeuroCard } from "@/components/ui/neuro-card";
import {
  Calendar,
  Clock,
  User,
  Video,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const DoctorAppointments = () => {
  const appointments = [
    {
      id: 1,
      patient: "Rajesh Kumar",
      time: "10:00 AM",
      type: "Follow-up",
      mode: "In-person",
      status: "confirmed",
    },
    {
      id: 2,
      patient: "Priya Sharma",
      time: "11:30 AM",
      type: "New Patient",
      mode: "Video",
      status: "confirmed",
    },
    {
      id: 3,
      patient: "Amit Patel",
      time: "02:00 PM",
      type: "Consultation",
      mode: "In-person",
      status: "pending",
    },
    {
      id: 4,
      patient: "Sneha Reddy",
      time: "03:30 PM",
      type: "Check-up",
      mode: "Video",
      status: "confirmed",
    },
  ];

  const handleComplete = (id: number) => {
    toast({ title: "Appointment marked as completed" });
  };

  const handleCancel = (id: number) => {
    toast({ title: "Appointment cancelled", variant: "destructive" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Today's Appointments</h1>
        <p className="text-muted-foreground">Manage your schedule</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <NeuroCard topBorderColor="#34D399">
          <div className="text-center">
            <p className="text-3xl font-bold text-accent mb-1">8</p>
            <p className="text-sm text-muted-foreground">Total Today</p>
          </div>
        </NeuroCard>
        <NeuroCard topBorderColor="#4F46E5">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary mb-1">6</p>
            <p className="text-sm text-muted-foreground">Confirmed</p>
          </div>
        </NeuroCard>
        <NeuroCard topBorderColor="#F59E0B">
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-600 mb-1">2</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
        </NeuroCard>
      </div>

      <div className="space-y-4">
        {appointments.map((apt) => (
          <NeuroCard
            key={apt.id}
            topBorderColor={apt.status === "confirmed" ? "#34D399" : "#F59E0B"}
            className="hover:translate-y-[-2px] transition-transform"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-doctor flex items-center justify-center text-white font-bold">
                  {apt.patient.charAt(0)}
                </div>

                <div className="space-y-3 flex-1">
                  <div>
                    <p className="text-lg font-bold">{apt.patient}</p>
                    <p className="text-sm text-muted-foreground">{apt.type}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{apt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {apt.mode === "Video" ? (
                        <Video className="h-4 w-4 text-accent" />
                      ) : (
                        <MapPin className="h-4 w-4 text-accent" />
                      )}
                      <span>{apt.mode}</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        apt.status === "confirmed"
                          ? "bg-accent/10 text-accent"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleComplete(apt.id)}
                  className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors"
                  title="Mark Complete"
                >
                  <CheckCircle className="h-5 w-5 text-accent" />
                </button>
                <button
                  onClick={() => handleCancel(apt.id)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                  title="Cancel"
                >
                  <XCircle className="h-5 w-5 text-red-600" />
                </button>
              </div>
            </div>
          </NeuroCard>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
