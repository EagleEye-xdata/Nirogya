import { useState } from "react";
import { NeuroCard } from "@/components/ui/neuro-card";
import { Search, Phone, Mail, Calendar, FileText } from "lucide-react";

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const patients = [
    { id: 1, name: "Rajesh Kumar", age: 42, lastVisit: "2 days ago", condition: "Diabetes", phone: "+91 98765 43210", email: "rajesh@email.com" },
    { id: 2, name: "Priya Sharma", age: 35, lastVisit: "1 week ago", condition: "Hypertension", phone: "+91 98765 43211", email: "priya@email.com" },
    { id: 3, name: "Amit Patel", age: 28, lastVisit: "3 days ago", condition: "Asthma", phone: "+91 98765 43212", email: "amit@email.com" },
    { id: 4, name: "Sneha Reddy", age: 45, lastVisit: "5 days ago", condition: "Thyroid", phone: "+91 98765 43213", email: "sneha@email.com" },
  ];

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Patient Management</h1>
        <p className="text-muted-foreground">View and manage your patients</p>
      </div>

      <NeuroCard>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patients by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-neuro-base shadow-neuro-inset focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </NeuroCard>

      <div className="grid gap-4">
        {filteredPatients.map((patient) => (
          <NeuroCard key={patient.id} topBorderColor="#4F46E5" className="hover:translate-y-[-2px] transition-transform">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-doctor flex items-center justify-center text-white font-bold text-lg">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xl font-bold">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Last visit: {patient.lastVisit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{patient.email}</span>
                  </div>
                </div>
                
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {patient.condition}
                </span>
              </div>
              
              <div className="flex flex-col gap-2">
                <button className="px-4 py-2 rounded-lg bg-accent/10 text-accent font-medium text-sm hover:bg-accent/20 transition-colors flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  View Records
                </button>
                <button className="px-4 py-2 rounded-lg border border-border font-medium text-sm hover:bg-muted transition-colors">
                  Schedule Visit
                </button>
              </div>
            </div>
          </NeuroCard>
        ))}
      </div>
    </div>
  );
};

export default Patients;
