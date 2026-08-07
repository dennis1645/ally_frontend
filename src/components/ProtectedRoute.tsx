import {
  Navigate,
  Outlet,
} from "react-router";

import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const {
    status,
    isAuthenticated,
  } = useAuth();

  if (status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-ally-background p-6">
        <div
          aria-live="polite"
          className="text-center"
        >
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-ally-blue-light border-t-ally-primary" />

          <p className="mt-4 text-ally-muted">
            Checking your expedition pass...
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  return <Outlet />;
}