import { useMemo } from "react";
import { useAuth, PatientProfile, DoctorProfile } from "@/contexts/AuthContext";

export const useProfile = () => {
  const { profile, updateProfile, user } = useAuth();

  const emergencySafe = useMemo(() => {
    if (!profile || !user) return null;
    if (user.role === "patient") {
      const p = profile as PatientProfile;
      return {
        fullName: p.fullName,
        bloodType: p.bloodType,
        allergies: p.allergies || [],
        emergencyContact: p.emergencyContact || "",
      };
    }
    // doctors may want minimal emergency info
    const d = profile as DoctorProfile;
    return {
      fullName: d.fullName,
      clinic: d.clinic || "",
      phone: d.phone || "",
    };
  }, [profile, user]);

  return {
    profile,
    updateProfile,
    emergencySafe,
  };
};

export default useProfile;
