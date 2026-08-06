import {
  Navigate,
  Outlet,
} from "react-router";

import { useAuth } from "../context/AuthContext";

import {
  getHomePathForUser,
  getUserRole,
  type NormalizedRole,
} from "../utils/authRouting";

type RoleRouteProps = {
  allowedRoles: NormalizedRole[];
};

export default function RoleRoute({
  allowedRoles,
}: RoleRouteProps) {
  const {
    user,
    status,
  } = useAuth();

  if (status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center">
        <p>Checking account permissions...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  const role = getUserRole(user);

  if (!allowedRoles.includes(role)) {
    return (
      <Navigate
        to={getHomePathForUser(user)}
        replace
      />
    );
  }

  return <Outlet />;
}