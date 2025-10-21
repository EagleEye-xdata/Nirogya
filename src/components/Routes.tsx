import { Routes as RouterRoutes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

// Patient Pages
import PatientDashboard from "@/pages/patient/Dashboard";
import UploadReports from "@/pages/patient/UploadReports";
import Timeline from "@/pages/patient/Timeline";
import AIChat from "@/pages/patient/AIChat";
import Appointments from "@/pages/patient/Appointments";
import EmergencyQR from "@/pages/patient/EmergencyQR";

// Doctor Pages
import DoctorDashboard from "@/pages/doctor/Dashboard";
import Patients from "@/pages/doctor/Patients";
import AIScribe from "@/pages/doctor/AIScribe";
import Prescriptions from "@/pages/doctor/Prescriptions";
import DoctorAppointments from "@/pages/doctor/DoctorAppointments";
import Billing from "@/pages/doctor/Billing";

export const Routes = () => {
  return (
    <RouterRoutes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />

      {/* Patient Routes */}
      <Route path="/patient">
        <Route
          path="dashboard"
          element={
            <ProtectedRoute roles={["patient"]}>
              <Layout role="patient">
                <PatientDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute roles={["patient"]}>
              <Layout role="patient">
                <UploadReports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="timeline"
          element={
            <ProtectedRoute roles={["patient"]}>
              <Layout role="patient">
                <Timeline />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="ai-chat"
          element={
            <ProtectedRoute roles={["patient"]}>
              <Layout role="patient">
                <AIChat />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="appointments"
          element={
            <ProtectedRoute roles={["patient"]}>
              <Layout role="patient">
                <Appointments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="emergency"
          element={
            <ProtectedRoute roles={["patient"]}>
              <Layout role="patient">
                <EmergencyQR />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Doctor Routes */}
      <Route path="/doctor">
        <Route
          path="dashboard"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <Layout role="doctor">
                <DoctorDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="patients"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <Layout role="doctor">
                <Patients />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="scribe"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <Layout role="doctor">
                <AIScribe />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="prescriptions"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <Layout role="doctor">
                <Prescriptions />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="appointments"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <Layout role="doctor">
                <DoctorAppointments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="billing"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <Layout role="doctor">
                <Billing />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};
