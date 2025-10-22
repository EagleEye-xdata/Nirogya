import { NeuroCard } from "@/components/ui/neuro-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { QrCode, Download, Share2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useState, useMemo } from "react";
import QRCode from "qrcode";

const EmergencyQR = () => {
  const { user } = useAuth();
  const { emergencySafe, profile } = useProfile();
  const [qrUrl, setQrUrl] = useState<string>("");

  interface EmergencyInfo {
    name?: string;
    age?: number | null;
    bloodGroup?: string;
    allergies?: string;
    conditions?: string;
    emergencyContact?: string;
    lastUpdated?: string;
  }

  // Convert profile to emergency info
  const emergencyInfo: EmergencyInfo | null = useMemo(() => {
    if (!profile || !emergencySafe || user?.role !== "patient") return null;
    return {
      name: emergencySafe.fullName,
      age: profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : undefined,
      bloodGroup: emergencySafe.bloodType || "",
      allergies: (emergencySafe.allergies || []).join(", ") || "None",
      emergencyContact: emergencySafe.emergencyContact || "",
      lastUpdated: profile._updatedAt || "",
    };
  }, [emergencySafe, profile, user]);

  useEffect(() => {
    // Generate QR code when emergency info changes
    const generateQR = async () => {
      if (!emergencySafe) {
        setQrUrl("");
        return;
      }
      try {
        // Only include emergencySafe fields in QR code
        const qr = await QRCode.toDataURL(JSON.stringify(emergencySafe), {
          width: 512,
          margin: 2,
          color: {
            dark: "#000",
            light: "#FFF",
          },
        });
        setQrUrl(qr);
      } catch (err) {
        console.error("Error generating QR code:", err);
        toast?.({ title: "Error generating QR code", variant: "destructive" });
      }
    };
    generateQR();
  }, [emergencySafe]);

  const handleDownload = useCallback(() => {
    if (!qrUrl) {
      toast?.({ title: "No QR code available", variant: "destructive" });
      return;
    }
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = "emergency-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast?.({ title: "QR Code downloaded successfully!" });
  }, [qrUrl]);

  const handleShare = useCallback(async () => {
    if (!qrUrl || !emergencySafe) {
      toast?.({ title: "No emergency info available to share", variant: "destructive" });
      return;
    }

    try {
      // Convert data URL to blob for sharing
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const file = new File([blob], "emergency-qr.png", { type: "image/png" });

      if (navigator.share) {
        await navigator.share({
          title: "Emergency Medical QR",
          text: "Emergency medical information QR code",
          files: [file],
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(JSON.stringify(emergencySafe, null, 2));
        toast?.({ title: "Emergency info copied to clipboard!" });
      }
    } catch (err) {
      console.error("Error sharing:", err);
      toast?.({ title: "Error sharing QR code", variant: "destructive" });
    }
  }, [qrUrl, emergencySafe]);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Emergency QR Code</h1>
        <p className="text-muted-foreground">Your medical info for emergency situations</p>
      </div>

      <NeuroCard topBorderColor="#F59E0B" className="bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-1 h-6 w-6 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-100">Important</p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This QR code contains critical medical information. Keep it accessible at all times
              and share with trusted emergency contacts.
            </p>
          </div>
        </div>
      </NeuroCard>

      <div className="grid gap-6 md:grid-cols-2">
        <NeuroCard topBorderColor="#3B82F6">
          <div className="space-y-4 text-center">
            <div className="mx-auto h-64 w-64 rounded-xl bg-white p-4 shadow-soft">
              {qrUrl ? (
                <img src={qrUrl} alt="Emergency QR Code" className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <QrCode className="h-16 w-16 text-muted-foreground/50" />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <AnimatedButton
                onClick={handleDownload}
                className="flex-1"
                size="sm"
                variant="gradient"
                disabled={!qrUrl}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </AnimatedButton>
              <AnimatedButton
                onClick={handleShare}
                className="flex-1"
                size="sm"
                variant="gradient"
                disabled={!qrUrl}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </AnimatedButton>
            </div>
          </div>
        </NeuroCard>

        <NeuroCard topBorderColor="#34D399">
          <h2 className="mb-4 text-xl font-bold">Emergency Information</h2>
          <div className="space-y-3">
            {emergencyInfo ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-semibold">{emergencyInfo.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-semibold">{emergencyInfo.age ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Group</p>
                    <p className="font-semibold text-accent">{emergencyInfo.bloodGroup || "-"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Allergies</p>
                  <p className="font-semibold text-red-600">{emergencyInfo.allergies}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Medical Conditions</p>
                  <p className="font-semibold">{emergencyInfo.conditions || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Emergency Contact</p>
                  <p className="font-semibold">{emergencyInfo.emergencyContact || "-"}</p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">
                    Last updated: {emergencyInfo.lastUpdated || "-"}
                  </p>
                </div>
                <div className="pt-4">
                  <Link to="/profile">
                    <AnimatedButton size="sm">Edit Profile</AnimatedButton>
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">No emergency profile found.</p>
                <Link to="/profile">
                  <AnimatedButton size="sm">Create / Edit Profile</AnimatedButton>
                </Link>
              </div>
            )}
          </div>
        </NeuroCard>
      </div>
    </div>
  );
};

export default EmergencyQR;
