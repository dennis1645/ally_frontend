import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  BadgeCheck,
  Coins,
  Crown,
  Edit,
  Eye,
  Flame,
  GraduationCap,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Trophy,
  UserCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  createUser,
  deleteUser,
  getUserDetail,
  getUsers,
  restoreUser,
  toggleUserStatus,
  updateUser,
  updateUserPassword,
  type AdminUser,
  type CreateAdminUserPayload,
  type UpdateAdminUserPayload,
} from "../../api/adminApi";

import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";

type CreateUserFormState = {
  name: string;
  email: string;
  phoneNumber: string;
  gender: string;
  role: string;
  password: string;
  isPremium: boolean;
};

type EditUserFormState = {
  name: string;
  role: string;
  isPremium: boolean;
};

type PasswordFormState = {
  password: string;
  passwordConfirmation: string;
};

const EMPTY_CREATE_FORM: CreateUserFormState = {
  name: "",
  email: "",
  phoneNumber: "",
  gender: "",
  role: "user",
  password: "",
  isPremium: false,
};

const EMPTY_EDIT_FORM: EditUserFormState = {
  name: "",
  role: "user",
  isPremium: false,
};

const EMPTY_PASSWORD_FORM: PasswordFormState = {
  password: "",
  passwordConfirmation: "",
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRole(role: string): string {
  if (!role) {
    return "User";
  }

  return role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function roleBadge(role: string): ReactNode {
  const normalized = role.toLowerCase();

  if (normalized === "admin") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
        <ShieldCheck size={12} /> Admin
      </span>
    );
  }

  if (normalized === "mentor") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <GraduationCap size={12} /> Mentor
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
      <UserRound size={12} /> User
    </span>
  );
}

function statusBadge(user: AdminUser): ReactNode {
  if (user.deletedAt) {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
        Deleted
      </span>
    );
  }

  const normalized = user.status.toLowerCase();

  if (normalized === "active") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
      {formatRole(user.status)}
    </span>
  );
}

function StatCard({
  label,
  value,
  note,
  icon,
  iconClassName,
}: {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <h3 className="mt-1 text-2xl font-bold text-gray-800">{value}</h3>
        <span className="text-xs text-gray-500">{note}</span>
      </div>
      <div className={`rounded-lg p-3 ${iconClassName}`}>{icon}</div>
    </div>
  );
}

export default function UserAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateUserFormState>(EMPTY_CREATE_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] =
    useState<EditUserFormState>(EMPTY_EDIT_FORM);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);
  const [passwordForm, setPasswordForm] =
    useState<PasswordFormState>(EMPTY_PASSWORD_FORM);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [processingId, setProcessingId] = useState<number | null>(null);

  async function loadUsers(mode: "initial" | "refresh" | "silent" = "initial") {
    try {
      if (mode === "initial") {
        setLoading(true);
      }

      if (mode === "refresh") {
        setRefreshing(true);
      }

      setError(null);

      const data = await getUsers();
      setUsers(data);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Failed to load platform users."),
      );
    } finally {
      if (mode === "initial") {
        setLoading(false);
      }

      if (mode === "refresh") {
        setRefreshing(false);
      }
    }
  }

  useEffect(() => {
    void loadUsers("initial");
  }, []);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        (user.phoneNumber ?? "").toLowerCase().includes(normalizedSearch);

      const matchesRole =
        roleFilter === "all" || user.role.toLowerCase() === roleFilter;

      const effectiveStatus = user.deletedAt
        ? "deleted"
        : user.status.toLowerCase();

      const matchesStatus =
        statusFilter === "all" || effectiveStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, normalizedSearch, roleFilter, statusFilter]);

  const activeUsers = users.filter(
    (user) => !user.deletedAt && user.status.toLowerCase() === "active",
  ).length;

  const mentorCount = users.filter(
    (user) => !user.deletedAt && user.role.toLowerCase() === "mentor",
  ).length;

  const premiumCount = users.filter(
    (user) => !user.deletedAt && user.isPremium,
  ).length;

  const openCreate = () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateError(null);
    setCreateOpen(true);
  };

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!createForm.name.trim()) {
      setCreateError("Name is required.");
      return;
    }

    if (!createForm.email.trim()) {
      setCreateError("Email is required.");
      return;
    }

    if (!createForm.phoneNumber.trim()) {
      setCreateError("Phone number is required.");
      return;
    }

    if (!createForm.password) {
      setCreateError("Password is required.");
      return;
    }

    const payload: CreateAdminUserPayload = {
      name: createForm.name.trim(),
      email: createForm.email.trim(),
      phone_number: createForm.phoneNumber.trim(),
      gender: createForm.gender || null,
      role: createForm.role,
      password: createForm.password,
      is_premium: createForm.isPremium,
    };

    try {
      setCreating(true);
      setCreateError(null);
      setError(null);
      setSuccess(null);

      await createUser(payload);

      setCreateOpen(false);
      setCreateForm(EMPTY_CREATE_FORM);
      setSuccess("User created successfully.");
      await loadUsers("silent");
    } catch (requestError) {
      setCreateError(
        getErrorMessage(requestError, "Failed to create the user."),
      );
    } finally {
      setCreating(false);
    }
  }

  async function openDetail(user: AdminUser) {
    try {
      setDetailUser(user);
      setDetailLoading(true);
      setDetailError(null);

      const freshUser = await getUserDetail(user.id);
      setDetailUser(freshUser);
    } catch (requestError) {
      setDetailError(
        getErrorMessage(requestError, "Failed to load user details."),
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function openEdit(user: AdminUser) {
    try {
      setEditUser(user);
      setEditForm({
        name: user.name,
        role: user.role,
        isPremium: user.isPremium,
      });
      setEditError(null);

      const freshUser = await getUserDetail(user.id);

      setEditUser(freshUser);
      setEditForm({
        name: freshUser.name,
        role: freshUser.role,
        isPremium: freshUser.isPremium,
      });
    } catch (requestError) {
      setEditError(
        getErrorMessage(requestError, "Failed to load the latest user data."),
      );
    }
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editUser) {
      return;
    }

    if (!editForm.name.trim()) {
      setEditError("Name is required.");
      return;
    }

    const payload: UpdateAdminUserPayload = {
      name: editForm.name.trim(),
      role: editForm.role,
      is_premium: editForm.isPremium,
    };

    try {
      setEditing(true);
      setEditError(null);
      setError(null);
      setSuccess(null);

      await updateUser(editUser.id, payload);

      setEditUser(null);
      setSuccess("User updated successfully.");
      await loadUsers("silent");
    } catch (requestError) {
      setEditError(
        getErrorMessage(requestError, "Failed to update the user."),
      );
    } finally {
      setEditing(false);
    }
  }

  function openPasswordReset(user: AdminUser) {
    setPasswordUser(user);
    setPasswordForm(EMPTY_PASSWORD_FORM);
    setPasswordError(null);
  }

  async function handlePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passwordUser) {
      return;
    }

    if (!passwordForm.password) {
      setPasswordError("New password is required.");
      return;
    }

    if (passwordForm.password !== passwordForm.passwordConfirmation) {
      setPasswordError("Password confirmation does not match.");
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordError(null);
      setError(null);
      setSuccess(null);

      await updateUserPassword(passwordUser.id, {
        password: passwordForm.password,
        password_confirmation: passwordForm.passwordConfirmation,
      });

      setPasswordUser(null);
      setPasswordForm(EMPTY_PASSWORD_FORM);
      setSuccess(`Password for ${passwordUser.name} was updated successfully.`);
    } catch (requestError) {
      setPasswordError(
        getErrorMessage(requestError, "Failed to update the user password."),
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleToggleStatus(user: AdminUser) {
    if (user.deletedAt) {
      return;
    }

    const nextAction =
      user.status.toLowerCase() === "active" ? "suspend" : "activate";

    const confirmed = window.confirm(
      `${nextAction === "suspend" ? "Suspend" : "Activate"} ${user.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(user.id);
      setError(null);
      setSuccess(null);

      await toggleUserStatus(user.id);
      setSuccess(
        `${user.name}'s account status was updated successfully.`,
      );
      await loadUsers("silent");
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Failed to update the user status."),
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(user: AdminUser) {
    const confirmed = window.confirm(
      `Delete ${user.name}?\n\nThis uses the admin delete-user endpoint.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(user.id);
      setError(null);
      setSuccess(null);

      await deleteUser(user.id);

      // Keep the record visible in the current session so Restore remains available
      // even if the normal GET list excludes soft-deleted users.
      setUsers((current) =>
        current.map((currentUser) =>
          currentUser.id === user.id
            ? {
                ...currentUser,
                deletedAt: new Date().toISOString(),
              }
            : currentUser,
        ),
      );

      setSuccess(`${user.name} was deleted successfully.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to delete the user."));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRestore(user: AdminUser) {
    const confirmed = window.confirm(`Restore ${user.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(user.id);
      setError(null);
      setSuccess(null);

      await restoreUser(user.id);
      setSuccess(`${user.name} was restored successfully.`);
      await loadUsers("silent");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to restore the user."));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <UserLayout
      title="User Management"
      subtitle="Manage user, mentor, and admin accounts"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <div className="min-h-full bg-gray-50 p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage platform accounts, roles, premium access, passwords, and account status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void loadUsers("refresh")}
              disabled={loading || refreshing}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={16} />
              Create User
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Loaded Accounts"
            value={`${users.length}`}
            note="Records returned by the admin API"
            icon={<Users size={24} />}
            iconClassName="bg-blue-50 text-blue-600"
          />

          <StatCard
            label="Active Accounts"
            value={`${activeUsers}`}
            note="Currently active and not deleted"
            icon={<UserCheck size={24} />}
            iconClassName="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            label="Mentors"
            value={`${mentorCount}`}
            note="Active mentor accounts"
            icon={<GraduationCap size={24} />}
            iconClassName="bg-amber-50 text-amber-600"
          />

          <StatCard
            label="Premium Accounts"
            value={`${premiumCount}`}
            note="Accounts with premium access"
            icon={<Crown size={24} />}
            iconClassName="bg-violet-50 text-violet-600"
          />
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search name, email, or phone..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="mentor">Mentor</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Premium</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {loading && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-400">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Loading users...
                      </span>
                    </td>
                  </tr>
                )}

                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-400">
                      No users match the current filters.
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredUsers.map((user) => {
                    const processing = processingId === user.id;

                    return (
                      <tr key={user.id} className="align-top transition hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex min-w-[250px] items-start gap-3">
                            {user.profilePictureUrl ? (
                              <img
                                src={user.profilePictureUrl}
                                alt={user.name}
                                className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                                {getInitials(user.name)}
                              </div>
                            )}

                            <div>
                              <p className="font-semibold text-gray-900">{user.name}</p>
                              <p className="mt-0.5 text-xs text-gray-500">{user.email}</p>
                              {user.phoneNumber && (
                                <p className="mt-0.5 text-xs text-gray-400">{user.phoneNumber}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-4">{roleBadge(user.role)}</td>

                        <td className="p-4">
                          {user.isPremium ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                              <Crown size={12} /> Premium
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">Free</span>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Trophy size={13} className="text-amber-500" />
                              Level {user.level} · {formatNumber(user.xpPoints)} XP
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Coins size={13} className="text-blue-500" />
                              {formatNumber(user.tokenBalance)} tokens
                            </div>
                          </div>
                        </td>

                        <td className="p-4">{statusBadge(user)}</td>

                        <td className="p-4 text-xs text-gray-500">
                          {formatDateTime(user.createdAt)}
                        </td>

                        <td className="p-4">
                          <div className="flex min-w-[220px] flex-wrap items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => void openDetail(user)}
                              title="View user detail"
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Eye size={16} />
                            </button>

                            {!user.deletedAt && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void openEdit(user)}
                                  title="Edit account"
                                  className="rounded-lg p-2 text-gray-400 transition hover:bg-amber-50 hover:text-amber-600"
                                >
                                  <Edit size={16} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openPasswordReset(user)}
                                  title="Reset password"
                                  className="rounded-lg p-2 text-gray-400 transition hover:bg-violet-50 hover:text-violet-600"
                                >
                                  <KeyRound size={16} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => void handleToggleStatus(user)}
                                  disabled={processing}
                                  title={
                                    user.status.toLowerCase() === "active"
                                      ? "Suspend account"
                                      : "Activate account"
                                  }
                                  className="rounded-lg p-2 text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                                >
                                  {processing ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : user.status.toLowerCase() === "active" ? (
                                    <ToggleRight size={17} />
                                  ) : (
                                    <ToggleLeft size={17} />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => void handleDelete(user)}
                                  disabled={processing}
                                  title="Delete user"
                                  className="rounded-lg p-2 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}

                            {user.deletedAt && (
                              <button
                                type="button"
                                onClick={() => void handleRestore(user)}
                                disabled={processing}
                                title="Restore user"
                                className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                              >
                                {processing ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <RotateCcw size={16} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Create User</h2>
                <p className="text-sm text-gray-500">Create a new user, mentor, or admin account.</p>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5 p-5">
              {createError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {createError}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium text-gray-700">
                  Name
                  <input
                    value={createForm.name}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-medium text-gray-700">
                  Email
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-medium text-gray-700">
                  Phone Number
                  <input
                    value={createForm.phoneNumber}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        phoneNumber: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-medium text-gray-700">
                  Gender
                  <select
                    value={createForm.gender}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        gender: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Not specified</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </label>

                <label className="space-y-1.5 text-sm font-medium text-gray-700">
                  Role
                  <select
                    value={createForm.role}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        role: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="user">User</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <label className="space-y-1.5 text-sm font-medium text-gray-700">
                  Password
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={createForm.isPremium}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      isPremium: event.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                Give this account premium access
              </label>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit User</h2>
                <p className="text-sm text-gray-500">Update account name, role, and premium access.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-5 p-5">
              {editError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {editError}
                </div>
              )}

              <label className="block space-y-1.5 text-sm font-medium text-gray-700">
                Name
                <input
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-gray-700">
                Role
                <select
                  value={editForm.role}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      role: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="user">User</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={editForm.isPremium}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      isPremium: event.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                Premium access
              </label>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {editing && <Loader2 size={16} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Reset Password</h2>
                <p className="text-sm text-gray-500">Set a new password for {passwordUser.name}.</p>
              </div>
              <button
                type="button"
                onClick={() => setPasswordUser(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-5 p-5">
              {passwordError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {passwordError}
                </div>
              )}

              <label className="block space-y-1.5 text-sm font-medium text-gray-700">
                New Password
                <input
                  type="password"
                  value={passwordForm.password}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-gray-700">
                Confirm Password
                <input
                  type="password"
                  value={passwordForm.passwordConfirmation}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      passwordConfirmation: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </label>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setPasswordUser(null)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {passwordSaving && <Loader2 size={16} className="animate-spin" />}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">User Detail</h2>
                <p className="text-sm text-gray-500">Latest account data from the admin API.</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailUser(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {detailLoading && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" /> Loading latest detail...
                </div>
              )}

              {detailError && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {detailError}
                </div>
              )}

              <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 sm:flex-row sm:items-center">
                {detailUser.profilePictureUrl ? (
                  <img
                    src={detailUser.profilePictureUrl}
                    alt={detailUser.name}
                    className="h-16 w-16 rounded-full border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                    {getInitials(detailUser.name)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">{detailUser.name}</h3>
                    {roleBadge(detailUser.role)}
                    {statusBadge(detailUser)}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{detailUser.email}</p>
                  {detailUser.headline && (
                    <p className="mt-2 text-sm font-medium text-gray-700">{detailUser.headline}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailField icon={<Mail size={15} />} label="Email" value={detailUser.email} />
                <DetailField icon={<Phone size={15} />} label="Phone" value={detailUser.phoneNumber ?? "—"} />
                <DetailField icon={<BadgeCheck size={15} />} label="Email Verified" value={formatDateTime(detailUser.emailVerifiedAt)} />
                <DetailField icon={<UserRound size={15} />} label="Gender" value={detailUser.gender ? formatRole(detailUser.gender) : "—"} />
                <DetailField icon={<Crown size={15} />} label="Premium" value={detailUser.isPremium ? "Yes" : "No"} />
                <DetailField icon={<Crown size={15} />} label="Premium Until" value={formatDateTime(detailUser.premiumUntil)} />
                <DetailField icon={<Trophy size={15} />} label="XP / Level" value={`${formatNumber(detailUser.xpPoints)} XP · Level ${detailUser.level}`} />
                <DetailField icon={<Coins size={15} />} label="Token Balance" value={formatNumber(detailUser.tokenBalance)} />
                <DetailField icon={<Flame size={15} />} label="Streak" value={`${detailUser.currentStreak} current · ${detailUser.longestStreak} longest`} />
                <DetailField icon={<GraduationCap size={15} />} label="Readiness Score" value={detailUser.readinessScore === null ? "—" : `${detailUser.readinessScore}%`} />
                <DetailField icon={<GraduationCap size={15} />} label="GPA" value={detailUser.gpa === null ? "—" : String(detailUser.gpa)} />
                <DetailField icon={<GraduationCap size={15} />} label="Undergraduate Major" value={detailUser.undergraduateMajor ?? "—"} />
                <DetailField icon={<GraduationCap size={15} />} label="Target Major" value={detailUser.targetMajor ?? "—"} />
                <DetailField icon={<GraduationCap size={15} />} label="Scholarship Target" value={detailUser.primaryScholarshipTarget ?? "—"} />
                <DetailField icon={<UserCheck size={15} />} label="Assigned Mentor ID" value={detailUser.assignedMentorId === null ? "—" : String(detailUser.assignedMentorId)} />
                <DetailField icon={<RefreshCw size={15} />} label="Updated" value={formatDateTime(detailUser.updatedAt)} />
              </div>

              {detailUser.bio && (
                <div className="mt-4 rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Bio</p>
                  <p className="mt-2 text-sm leading-6 text-gray-700">{detailUser.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}

function DetailField({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {icon}
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}