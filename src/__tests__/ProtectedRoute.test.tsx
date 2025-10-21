import React from "react";
/// <reference types="vitest" />
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { ProtectedRoute } from "../components/ProtectedRoute";

function ProtectedApp() {
  return (
    <AuthProvider>
      <MemoryRouter initialEntries={["/patient/dashboard"]}>
        <Routes>
          <Route path="/auth" element={<div>Login Page</div>} />
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute roles={["patient"]}>
                <div>Protected Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("ProtectedRoute", () => {
  it("redirects unauthenticated user to /auth", () => {
    render(<ProtectedApp />);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
