import { NeuroCard } from "@/components/ui/neuro-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { QrCode, Download, Share2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const EmergencyQR = () => {
  const emergencyInfo = {
    name: "Rajesh Kumar",
    age: 42,
    bloodGroup: "O+",
    allergies: "Penicillin",
    conditions: "Type 2 Diabetes, Hypertension",
    emergencyContact: "+91 98765 43210",
    lastUpdated: "18 Oct 2025",
  };

  const handleDownload = () => {
    toast({ title: "QR Code downloaded successfully!" });
  };

  const handleShare = () => {
    toast({ title: "Share link copied to clipboard!" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Emergency QR Code</h1>
        <p className="text-muted-foreground">
          Your medical info for emergency situations
        </p>
      </div>

      <NeuroCard topBorderColor="#F59E0B" className="bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              Important
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This QR code contains critical medical information. Keep it
              accessible at all times and share with trusted emergency contacts.
            </p>
          </div>
        </div>
      </NeuroCard>

      <div className="grid md:grid-cols-2 gap-6">
        <NeuroCard topBorderColor="#3B82F6">
          <div className="text-center space-y-4">
            <div className="w-64 h-64 mx-auto bg-white rounded-xl p-4 shadow-soft">
              <QrCode className="w-full h-full text-foreground" />
            </div>
            <div className="flex gap-3">
              <AnimatedButton
                onClick={handleDownload}
                className="flex-1"
                size="sm"
                variant="gradient"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </AnimatedButton>
              <AnimatedButton
                onClick={handleShare}
                className="flex-1"
                size="sm"
                variant="gradient"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </AnimatedButton>
            </div>
          </div>
        </NeuroCard>

        <NeuroCard topBorderColor="#34D399">
          <h2 className="text-xl font-bold mb-4">Emergency Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-semibold">{emergencyInfo.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-semibold">{emergencyInfo.age}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Group</p>
                <p className="font-semibold text-accent">
                  {emergencyInfo.bloodGroup}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Allergies</p>
              <p className="font-semibold text-red-600">
                {emergencyInfo.allergies}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Medical Conditions
              </p>
              <p className="font-semibold">{emergencyInfo.conditions}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Emergency Contact</p>
              <p className="font-semibold">{emergencyInfo.emergencyContact}</p>
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Last updated: {emergencyInfo.lastUpdated}
              </p>
            </div>
          </div>
        </NeuroCard>
      </div>
    </div>
  );
};

export default EmergencyQR;
