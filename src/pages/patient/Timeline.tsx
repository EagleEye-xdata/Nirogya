import { NeuroCard } from "@/components/ui/neuro-card";
import { FileText, Calendar, Activity, Pill, Stethoscope } from "lucide-react";

const Timeline = () => {
  const events = [
    { date: "18 Oct 2025", type: "report", title: "Blood Test Results", desc: "All parameters normal", icon: FileText, color: "#3B82F6" },
    { date: "15 Oct 2025", type: "appointment", title: "Dr. Sharma Consultation", desc: "Routine checkup completed", icon: Stethoscope, color: "#34D399" },
    { date: "10 Oct 2025", type: "prescription", title: "Prescription Refill", desc: "Medication for 30 days", icon: Pill, color: "#F59E0B" },
    { date: "05 Oct 2025", type: "report", title: "X-Ray Report", desc: "Chest X-ray - Clear", icon: FileText, color: "#3B82F6" },
    { date: "01 Oct 2025", type: "activity", title: "Health Score Update", desc: "Score improved to 85%", icon: Activity, color: "#4F46E5" },
    { date: "28 Sep 2025", type: "appointment", title: "Cardiology Checkup", desc: "Heart health excellent", icon: Stethoscope, color: "#34D399" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Health Timeline</h1>
        <p className="text-muted-foreground">Track your complete medical journey</p>
      </div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary/20" />
        
        <div className="space-y-6">
          {events.map((event, idx) => (
            <div key={idx} className="relative pl-20 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <div 
                className="absolute left-4 w-8 h-8 rounded-full flex items-center justify-center shadow-soft"
                style={{ backgroundColor: event.color }}
              >
                <event.icon className="h-4 w-4 text-white" />
              </div>
              
              <NeuroCard topBorderColor={event.color} className="hover:translate-x-2 transition-transform">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-lg">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.desc}</p>
                    </div>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {event.date}
                    </span>
                  </div>
                </div>
              </NeuroCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
