import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Loading } from "@/components/ui/loading";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: Array<"patient" | "doctor">;
}

interface UserData {
  uid: string;
  role: "patient" | "doctor";
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const [user, setUser] = useState<UserData | null | undefined>(undefined); // undefined while loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }

      try {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUser(data);
        } else {
          // If user exists in Auth but not in Firestore
          setUser({ uid: firebaseUser.uid, role: "patient" }); // default role
        }
      } catch (err) {
        console.error(err);
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Loading state
  if (user === undefined) {
    return <Loading fullScreen text="Checking authentication..." />;
  }

  // Not logged in
  if (user === null) {
    return <Navigate to="/auth" replace />;
  }

  // Role mismatch
  if (roles && !roles.includes(user.role)) {
    const dashboard = user.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard";
    return <Navigate to={dashboard} replace />;
  }

  return <>{children}</>;
};
