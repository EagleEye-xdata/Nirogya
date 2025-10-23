import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FloatingInput } from "@/components/ui/floating-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { auth, db } from "@/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface PatientProfile {
  fullName: string;
  phone?: string;
  dob?: string;
  allergies?: string[];
  emergencyContact?: string;
  bloodType?: string;
  address?: string;
}

interface DoctorProfile {
  fullName: string;
  phone?: string;
  degree?: string;
  licenseNumber?: string;
  specialization?: string;
  clinic?: string;
  yearsExperience?: number;
  acceptingNewPatients?: boolean;
}

const SPECIALIZATIONS = [
  "Cardiologist",
  "General Physician",
  "Endocrinologist",
  "Neurologist",
  "Orthopedic Surgeon",
  "Dermatologist",
  "Pulmonologist",
  "Pediatrician",
  "Ophthalmologist",
];

const ProfileModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [patient, setPatient] = useState<PatientProfile>({ fullName: "" });
  const [doctor, setDoctor] = useState<DoctorProfile>({ fullName: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;
      setUser(firebaseUser);

      // Fetch user role from Firestore
      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as { role: "patient" | "doctor"; profile?: any };
        setRole(data.role);
        if (data.profile) {
          if (data.role === "patient") setPatient(data.profile);
          else setDoctor(data.profile);
        }
      } else {
        // No data yet → open modal
        setOpen(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (role === "patient") {
      if (!patient.fullName || patient.fullName.trim().length < 2)
        errs.fullName = "Please enter a valid full name.";
      if (patient.phone && !/^\+?[0-9\-\s]{7,15}$/.test(patient.phone))
        errs.phone = "Enter a valid phone number.";
    } else {
      if (!doctor.fullName || doctor.fullName.trim().length < 2)
        errs.fullName = "Please enter a valid full name.";
      if (doctor.phone && !/^\+?[0-9\-\s]{7,15}$/.test(doctor.phone))
        errs.phone = "Enter a valid phone number.";
      if (doctor.licenseNumber && !/^[A-Za-z0-9-/\s]{4,20}$/.test(doctor.licenseNumber))
        errs.licenseNumber = "Enter a valid license number.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = async () => {
    if (!validate() || !user) return;

    const profileData = role === "patient" ? patient : doctor;

    try {
      await setDoc(
        doc(db, "users", user.uid),
        { role, profile: profileData },
        { merge: true }
      );
      setOpen(false);
    } catch (err) {
      console.error("Failed to save profile", err);
    }
  };

  const skip = () => {
    if (!user) return;
    setOpen(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete your profile</DialogTitle>
          <DialogDescription>
            Help us personalize your experience by adding some basic information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {role === "patient" ? (
            <div className="grid grid-cols-1 gap-3">
              <FloatingInput
                label="Full name"
                value={patient.fullName || ""}
                onChange={(e) => setPatient({ ...patient, fullName: e.target.value })}
              />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
              <FloatingInput
                label="Phone number"
                value={patient.phone || ""}
                onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
                type="tel"
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <FloatingInput
                label="Full name"
                value={doctor.fullName || ""}
                onChange={(e) => setDoctor({ ...doctor, fullName: e.target.value })}
              />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
              <FloatingInput
                label="Phone number"
                value={doctor.phone || ""}
                onChange={(e) => setDoctor({ ...doctor, phone: e.target.value })}
                type="tel"
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={skip}>
              Skip for now
            </Button>
            <Button onClick={save}>Save Profile</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
