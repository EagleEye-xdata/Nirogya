import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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
import { useAuth } from "@/contexts/AuthContext";

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

const getProfileKey = (userId: string) => `profile_${userId}`;

const ProfileModal: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [patient, setPatient] = useState<PatientProfile>({ fullName: "" });
  const [doctor, setDoctor] = useState<DoctorProfile>({ fullName: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    const key = getProfileKey(user.id);
    const existing = localStorage.getItem(key);
    if (!existing) setOpen(true);
    else {
      try {
        const parsed = JSON.parse(existing);
        if (user.role === "patient") setPatient(parsed);
        else setDoctor(parsed);
      } catch (error) {
        console.error("Failed to parse profile from localStorage", error);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!profile || !user) return;
    if (user.role === "patient") setPatient(profile);
    else setDoctor(profile);
  }, [profile, user]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (user?.role === "patient") {
      if (!patient.fullName || patient.fullName.trim().length < 2)
        errs.fullName = "Please enter a valid full name.";
      if (patient.phone && !/^\+?[0-9\-\s]{7,15}$/.test(patient.phone))
        errs.phone = "Enter a valid phone number.";
      if (patient.dob) {
        const dobDate = new Date(patient.dob);
        if (isNaN(dobDate.getTime()) || dobDate > new Date())
          errs.dob = "Enter a valid date of birth.";
      }
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

  const save = () => {
    if (!validate()) return;
    if (!user) return;
    if (user.role === "patient") updateProfile({ ...(patient as PatientProfile) });
    else updateProfile({ ...(doctor as DoctorProfile) });
    setOpen(false);
  };

  const skip = () => {
    if (!user) return;
    localStorage.setItem(getProfileKey(user.id), JSON.stringify({ skipped: true }));
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
          {user.role === "patient" ? (
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
              <FloatingInput
                label="Date of birth"
                value={patient.dob || ""}
                onChange={(e) => setPatient({ ...patient, dob: e.target.value })}
                type="date"
              />
              {errors.dob && <p className="text-sm text-destructive">{errors.dob}</p>}
              <FloatingInput
                label="Allergies (comma separated)"
                value={(patient.allergies || []).join(", ")}
                onChange={(e) =>
                  setPatient({
                    ...patient,
                    allergies: e.target.value
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
              <FloatingInput
                label="Emergency contact"
                value={patient.emergencyContact || ""}
                onChange={(e) => setPatient({ ...patient, emergencyContact: e.target.value })}
              />
              <Select onValueChange={(v) => setPatient({ ...patient, bloodType: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={patient.bloodType || "Blood Type"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
              <FloatingInput
                label="Address"
                value={patient.address || ""}
                onChange={(e) => setPatient({ ...patient, address: e.target.value })}
              />
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
              <FloatingInput
                label="Degree (e.g., MBBS, MD)"
                value={doctor.degree || ""}
                onChange={(e) => setDoctor({ ...doctor, degree: e.target.value })}
              />
              <FloatingInput
                label="License number"
                value={doctor.licenseNumber || ""}
                onChange={(e) => setDoctor({ ...doctor, licenseNumber: e.target.value })}
              />
              {errors.licenseNumber && (
                <p className="text-sm text-destructive">{errors.licenseNumber}</p>
              )}
              <Select onValueChange={(v) => setDoctor({ ...doctor, specialization: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={doctor.specialization || "Specialization"} />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FloatingInput
                label="Clinic / Hospital"
                value={doctor.clinic || ""}
                onChange={(e) => setDoctor({ ...doctor, clinic: e.target.value })}
              />
              <FloatingInput
                label="Years of experience"
                type="number"
                value={doctor.yearsExperience?.toString() || ""}
                onChange={(e) =>
                  setDoctor({ ...doctor, yearsExperience: Number(e.target.value) || 0 })
                }
              />
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="accepting"
                  type="checkbox"
                  checked={!!doctor.acceptingNewPatients}
                  onChange={(e) => setDoctor({ ...doctor, acceptingNewPatients: e.target.checked })}
                />
                <label htmlFor="accepting">Accepting new patients</label>
              </div>
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
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
