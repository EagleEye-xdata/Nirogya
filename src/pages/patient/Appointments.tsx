import { useState } from "react";
import { NeuroCard } from "@/components/ui/neuro-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Calendar, Clock, MapPin, Video, Plus } from "lucide-react";
import { FloatingInput } from "@/components/ui/floating-input";
import { toast } from "@/hooks/use-toast";

const Appointments = () => {
  const [showBooking, setShowBooking] = useState(false);
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctor: "Dr. Sharma",
      specialty: "General Physician",
      date: "25 Oct 2025",
      time: "10:00 AM",
      type: "In-person",
      location: "Clinic A, Mumbai",
    },
    {
      id: 2,
      doctor: "Dr. Patel",
      specialty: "Cardiologist",
      date: "28 Oct 2025",
      time: "02:30 PM",
      type: "Video Call",
      location: "Online",
    },
  ]);

  const handleBook = () => {
    toast({ title: "Appointment booked successfully!" });
    setShowBooking(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
          <p className="text-muted-foreground">
            Manage your upcoming consultations
          </p>
        </div>
        <AnimatedButton
          onClick={() => setShowBooking(!showBooking)}
          variant="gradient"
          size="md"
        >
          <Plus className="h-5 w-5 mr-2" />
          Book New
        </AnimatedButton>
      </div>

      {showBooking && (
        <NeuroCard topBorderColor="#34D399" className="animate-scale-in">
          <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <FloatingInput label="Doctor Name" type="text" />
            <FloatingInput label="Specialty" type="text" />
            <FloatingInput label="Preferred Date" type="date" />
            <FloatingInput label="Preferred Time" type="time" />
            <div className="md:col-span-2">
              <FloatingInput label="Reason for Visit" type="text" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <AnimatedButton
              onClick={handleBook}
              className="flex-1"
              size="md"
              variant="gradient"
            >
              Confirm Booking
            </AnimatedButton>
            <button
              onClick={() => setShowBooking(false)}
              className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </NeuroCard>
      )}

      <div className="grid gap-4">
        {appointments.map((apt) => (
          <NeuroCard
            key={apt.id}
            topBorderColor="#3B82F6"
            className="hover:translate-y-[-2px] transition-transform"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div>
                  <p className="text-xl font-bold">{apt.doctor}</p>
                  <p className="text-sm text-muted-foreground">
                    {apt.specialty}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{apt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{apt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {apt.type === "Video Call" ? (
                      <Video className="h-4 w-4 text-accent" />
                    ) : (
                      <MapPin className="h-4 w-4 text-accent" />
                    )}
                    <span>{apt.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button className="px-4 py-2 rounded-lg bg-accent/10 text-accent font-medium text-sm hover:bg-accent/20 transition-colors">
                  {apt.type === "Video Call" ? "Join Call" : "Get Directions"}
                </button>
                <button className="px-4 py-2 rounded-lg border border-border font-medium text-sm hover:bg-muted transition-colors">
                  Reschedule
                </button>
              </div>
            </div>
          </NeuroCard>
        ))}
      </div>
    </div>
  );
};

export default Appointments;
