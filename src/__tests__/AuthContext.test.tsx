/// <reference types="vitest" />
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

function Consumer() {
  const { user, login, signup } = useAuth();

  return (
    <div>
      <div data-testid="user">{user ? user.email : "no-user"}</div>
      <button onClick={() => login("patient@example.com", "pw")}>login</button>
      <button
        onClick={() =>
          signup({
            email: "a@b.com",
            password: "pw",
            name: "A",
            role: "patient",
          })
        }
      >
        signup
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("login sets user and localStorage", async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText("login"));

    await waitFor(() =>
      expect(screen.getByTestId("user").textContent).not.toBe("no-user")
    );
    expect(localStorage.getItem("auth_token")).toBe("mock_token");
  });

  it("signup sets user and localStorage", async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText("signup"));

    await waitFor(() =>
      expect(screen.getByTestId("user").textContent).not.toBe("no-user")
    );
    expect(localStorage.getItem("auth_token")).toBe("mock_token");
  });
});
