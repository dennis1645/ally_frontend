import type {
  AuthUser,
  UserRoleObject,
} from "../types/auth";

export type NormalizedRole =
  | "user"
  | "mentor"
  | "admin";

export function getUserRole(
  user: AuthUser,
): NormalizedRole {
  const role = user.role;

  let rawRole = "";

  if (typeof role === "string") {
    rawRole = role;
  } else if (
    role &&
    typeof role === "object"
  ) {
    const roleObject = role as UserRoleObject;

    rawRole =
      roleObject.slug ??
      roleObject.name ??
      "";
  }

  const normalizedRole = rawRole
    .trim()
    .toLowerCase();

  if (normalizedRole.includes("admin")) {
    return "admin";
  }

  if (normalizedRole.includes("mentor")) {
    return "mentor";
  }

  return "user";
}

export function getHomePathForUser(
  user: AuthUser,
): string {
  const role = getUserRole(user);

  switch (role) {
    case "admin":
      return "/admin/dashboard";

    case "mentor":
      return "/mentor/dashboard";

    default:
      return "/dashboard";
  }
}