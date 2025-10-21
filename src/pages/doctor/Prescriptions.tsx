import { useState } from "react";
import { NeuroCard } from "@/components/ui/neuro-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Plus, FileText, Calendar, User, Printer } from "lucide-react";
import { FloatingInput } from "@/components/ui/floating-input";
import { toast } from "@/hooks/use-toast";

const Prescriptions = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [prescriptions] = useState([
    {
      id: 1,
      patient: "Rajesh Kumar",
      date: "18 Oct 2025",
      diagnosis: "Diabetes Type 2",
      medicines: 3,
    },
    {
      id: 2,
      patient: "Priya Sharma",
      date: "17 Oct 2025",
      diagnosis: "Hypertension",
      medicines: 2,
    },
    {
      id: 3,
      patient: "Amit Patel",
      date: "15 Oct 2025",
      diagnosis: "Asthma",
      medicines: 2,
    },
  ]);

  const handleCreate = () => {
    toast({ title: "Prescription created successfully!" });
    setShowCreate(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Prescriptions</h1>
          <p className="text-muted-foreground">
            Create and manage prescriptions
          </p>
        </div>
        <AnimatedButton
          onClick={() => setShowCreate(!showCreate)}
          variant="gradient"
          size="md"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Prescription
        </AnimatedButton>
      </div>

      {showCreate && (
        <NeuroCard topBorderColor="#34D399" className="animate-scale-in">
          <h2 className="text-xl font-bold mb-4">Create New Prescription</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FloatingInput label="Patient Name" type="text" />
              <FloatingInput label="Age" type="number" />
              <FloatingInput label="Diagnosis" type="text" />
              <FloatingInput label="Date" type="date" />
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Medications</h3>
              <div className="grid md:grid-cols-3 gap-3">
                <FloatingInput label="Medicine Name" type="text" />
                <FloatingInput label="Dosage" type="text" />
                <FloatingInput label="Duration" type="text" />
              </div>
              <button className="text-sm text-primary hover:underline">
                + Add another medicine
              </button>
            </div>

            <div>
              <FloatingInput label="Special Instructions" type="text" />
            </div>

            <div className="flex gap-3 mt-6">
              <AnimatedButton
                onClick={handleCreate}
                variant="gradient"
                className="flex-1"
                size="md"
              >
                Create Prescription
              </AnimatedButton>
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </NeuroCard>
      )}

      <div className="grid gap-4">
        {prescriptions.map((rx) => (
          <NeuroCard
            key={rx.id}
            topBorderColor="#4F46E5"
            className="hover:translate-y-[-2px] transition-transform"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-lg font-bold">{rx.patient}</p>
                    <p className="text-sm text-muted-foreground">
                      {rx.diagnosis}
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{rx.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {rx.medicines} medicines prescribed
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
                  <Printer className="h-5 w-5" />
                </button>
                <button className="px-4 py-2 rounded-lg bg-accent/10 text-accent font-medium text-sm hover:bg-accent/20 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </NeuroCard>
        ))}
      </div>
    </div>
  );
};

export default Prescriptions;
