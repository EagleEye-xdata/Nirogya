import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingInput } from "@/components/ui/floating-input";
import { Button } from "@/components/ui/button";
import { NeuroCard } from "@/components/ui/neuro-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import type {
  PatientProfile as PatientProfileType,
  DoctorProfile as DoctorProfileType,
} from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

type ProfileType = PatientProfileType | DoctorProfileType | null;

const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { profile: hookProfile } = useProfile();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [edited, setEdited] = useState<ProfileType>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    // initialize edited from centralized profile or sensible defaults
    if (profile) setEdited(profile as ProfileType);
    else {
      if (user.role === "patient") {
        setEdited({ fullName: user.name } as PatientProfileType);
      } else {
        setEdited({ fullName: user.name } as DoctorProfileType);
      }
    }
    setLoading(false);
  }, [user, profile]);

  type DiffValue = string | number | boolean | string[] | null | undefined;
  type DiffChange = { from: DiffValue; to: DiffValue };

  const diff = useMemo(() => {
    const orig = profile || ({} as Record<string, DiffValue>);
    const curr = edited || ({} as Record<string, DiffValue>);
    const changes: Record<string, DiffChange> = {};
    const keys = new Set([...Object.keys(orig), ...Object.keys(curr)]);
    keys.forEach((k) => {
      const a = orig[k];
      const b = curr[k];
      const aa = Array.isArray(a) ? a.join(", ") : String(a ?? "");
      const bb = Array.isArray(b) ? b.join(", ") : String(b ?? "");
      if (aa !== bb) changes[k] = { from: a, to: b };
    });
    return changes;
  }, [profile, edited]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!edited || !user) return false;
    if (user?.role === "patient") {
      if (!edited.fullName || edited.fullName.trim().length < 2)
        errs.fullName = "Please enter a valid full name.";
      if (
        (edited as PatientProfileType).phone &&
        !/^\+?[0-9\-\s]{7,15}$/.test((edited as PatientProfileType).phone!)
      )
        errs.phone = "Enter a valid phone number.";
      if ((edited as PatientProfileType).dob) {
        const d = new Date((edited as PatientProfileType).dob!);
        if (isNaN(d.getTime()) || d > new Date()) errs.dob = "Enter a valid date of birth.";
      }
    } else {
      if (!edited.fullName || edited.fullName.trim().length < 2)
        errs.fullName = "Please enter a valid full name.";
      if (
        (edited as DoctorProfileType).phone &&
        !/^\+?[0-9\-\s]{7,15}$/.test((edited as DoctorProfileType).phone!)
      )
        errs.phone = "Enter a valid phone number.";
      if (
        (edited as DoctorProfileType).licenseNumber &&
        !/^[A-Za-z0-9\-/\s]{4,20}$/.test((edited as DoctorProfileType).licenseNumber || "")
      )
        errs.licenseNumber = "Enter a valid license number.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = () => {
    if (!validate() || !edited) return;
    updateProfile(
      user.role === "patient" ? (edited as PatientProfileType) : (edited as DoctorProfileType)
    );
    toast?.({ title: "Profile saved" });
    // refresh data on the page
    navigate(0);
  };

  const discard = () => {
    setEdited(
      profile || (user?.role === "patient" ? { fullName: user.name } : { fullName: user.name })
    );
    setErrors({});
  };

  if (!user) return <div>Please sign in</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
      </div>

      <NeuroCard>
        <div className="p-4">
          {loading ? (
            <div>Loading...</div>
          ) : user.role === "patient" ? (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <FloatingInput
                  label="Full name"
                  value={(edited as PatientProfileType)?.fullName || ""}
                  onChange={(e) =>
                    setEdited({ ...(edited || {}), fullName: e.target.value } as ProfileType)
                  }
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>

              <div>
                <FloatingInput
                  label="Phone"
                  value={(edited as PatientProfileType)?.phone || ""}
                  onChange={(e) =>
                    setEdited({ ...(edited || {}), phone: e.target.value } as ProfileType)
                  }
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <FloatingInput
                  label="Date of birth"
                  type="date"
                  value={(edited as PatientProfileType)?.dob || ""}
                  onChange={(e) =>
                    setEdited({ ...(edited || {}), dob: e.target.value } as ProfileType)
                  }
                />
                {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
              </div>

              <div>
                <FloatingInput
                  label="Allergies (comma separated)"
                  value={((edited as PatientProfileType)?.allergies || []).join(", ")}
                  onChange={(e) =>
                    setEdited({
                      ...(edited || {}),
                      allergies: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    } as ProfileType)
                  }
                />
              </div>

              <div>
                <FloatingInput
                  label="Emergency contact"
                  value={(edited as PatientProfileType)?.emergencyContact || ""}
                  onChange={(e) =>
                    setEdited({
                      ...(edited || {}),
                      emergencyContact: e.target.value,
                    } as ProfileType)
                  }
                />
              </div>

              <div>
                <Select
                  value={(edited as PatientProfileType)?.bloodType || ""}
                  onValueChange={(v) =>
                    setEdited({ ...(edited || {}), bloodType: v } as ProfileType)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={(edited as PatientProfileType)?.bloodType || "Blood Type"}
                    />
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
              </div>

              <div>
                <FloatingInput
                  label="Address"
                  value={(edited as PatientProfileType)?.address || ""}
                  onChange={(e) =>
                    setEdited({ ...(edited || {}), address: e.target.value } as ProfileType)
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={save}>Save</Button>
                <Button variant="outline" onClick={discard}>
                  Discard
                </Button>
              </div>

              {/* Show diff for clarity */}
              {Object.keys(diff).length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold">Changes</h3>
                  <ul className="mt-2 space-y-2">
                    {Object.entries(diff).map(([k, v]) => (
                      <li key={k} className="text-sm">
                        <strong>{k}</strong>: {String(v.from ?? "-")} →{" "}
                        <span className="font-medium">{String(v.to ?? "-")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <FloatingInput
                  label="Full name"
                  value={(edited as DoctorProfileType)?.fullName || ""}
                  onChange={(e) =>
                    setEdited({ ...(edited || {}), fullName: e.target.value } as ProfileType)
                  }
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>

              <div>
                <FloatingInput
                  label="Phone"
                  value={(edited as DoctorProfileType)?.phone || ""}
                  onChange={(e) =>
                    setEdited({ ...(edited || {}), phone: e.target.value } as ProfileType)
                  }
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <FloatingInput
                  label="Degree"
                  value={(edited as DoctorProfileType)?.degree || ""}
                  onChange={(e) =>
                    setEdited({ ...(edited || {}), degree: e.target.value } as ProfileType)
                  }
                />
              </div>

              <div>
                <FloatingInput
                  label="License number"
                  value={(edited as DoctorProfileType)?.licenseNumber || ""}
                  onChange={(e) =>
                    setEdited({ ...(edited || {}), licenseNumber: e.target.value } as ProfileType)
                  }
                />
                {errors.licenseNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
                )}
              </div>

              <div>
                <FloatingInput
                  label="Clinic / Hospital"
                  value={(edited as DoctorProfileType)?.clinic || ""}
                  onChange={(e) =>
                    setEdited({ ...(edited || {}), clinic: e.target.value } as ProfileType)
                  }
                />
              </div>

              <div>
                <FloatingInput
                  label="Years of experience"
                  type="number"
                  value={(edited as DoctorProfileType)?.yearsExperience?.toString?.() || ""}
                  onChange={(e) =>
                    setEdited({
                      ...(edited || {}),
                      yearsExperience: Number(e.target.value) || 0,
                    } as ProfileType)
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={save}>Save</Button>
                <Button variant="outline" onClick={discard}>
                  Discard
                </Button>
              </div>

              {/* Show diff for doctors */}
              {Object.keys(diff).length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold">Pending changes</h3>
                  <ul className="mt-2 space-y-2">
                    {Object.entries(diff).map(([k, v]) => (
                      <li key={k} className="text-sm">
                        <strong>{k}</strong>: {String(v.from ?? "-")} →{" "}
                        <span className="font-medium">{String(v.to ?? "-")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </NeuroCard>
    </div>
  );
};

export default ProfilePage;
