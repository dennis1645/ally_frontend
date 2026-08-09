import { useEffect, useState } from "react";
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw, 
  LockKeyhole,
  MoreVertical
} from "lucide-react";

import { getUsers, type AdminUser } from "../../api/adminApi";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getUsers();

        if (!mounted) return;

        setUsers(data);
      } catch (err: any) {
        console.error("Failed to load users:", err);
        if (!mounted) return;
        setError(err?.message || "Gagal mengambil data pengguna");
        setUsers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <UserLayout
      title="User Management"
      subtitle="Kelola pengguna platform"
      sidebarItems={adminSidebarItems}
    >
      <div className="p-6 bg-gray-50">
      {/* --- HEADER & ADD BUTTON --- */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500">Kelola data mentee dan mentor platform.</p>
        </div>
        {/* Trigger POST Create User */}
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <UserPlus size={18} />
          <span>Add New User</span>
        </button>
      </div>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-800">{loading ? "—" : users?.length ?? 0}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Users</p>
            <h3 className="text-2xl font-bold text-gray-800">{loading ? "—" : users?.filter(u => (u as any).status === 'Active').length ?? 0}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <UserX size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Suspended Users</p>
            <h3 className="text-2xl font-bold text-gray-800">{loading ? "—" : users?.filter(u => (u as any).status === 'Suspended').length ?? 0}</h3>
          </div>
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      {error && (
        <div className="mb-4 rounded p-3 bg-red-50 text-red-700">{error}</div>
      )}

      {loading && (
        <div className="mb-4 rounded p-3 bg-white text-sm text-slate-500">Memuat data pengguna...</div>
      )}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-sm font-medium text-gray-500">Name</th>
                <th className="p-4 text-sm font-medium text-gray-500">Email</th>
                <th className="p-4 text-sm font-medium text-gray-500">Role</th>
                <th className="p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="p-4 text-sm font-medium text-gray-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(users ?? []).map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-sm text-gray-800 font-medium">
                    {user.name} 
                    {(user as any).isDeleted && <span className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">(Deleted)</span>}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{user.email}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className={`px-3 py-1 rounded-full text-xs ${user.role === 'Mentor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs ${(user as any).status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {(user as any).status ?? '—'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-center gap-2">
                    {/* Trigger GET User Detail */}
                    <button title="View Detail" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Eye size={16} />
                    </button>
                    
                    {/* Trigger PUT Update User */}
                    <button title="Edit Profile" className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition">
                      <Edit size={16} />
                    </button>
                    
                    {/* Trigger PUT Update User Password */}
                    <button title="Force Reset Password" className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                      <LockKeyhole size={16} />
                    </button>

                    {/* Trigger PUT Toggle User Status (Suspend/Activate) */}
                    <button title="Toggle Suspend/Activate" className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition">
                      <MoreVertical size={16} /> 
                    </button>

                    {(user as any).isDeleted ? (
                      // Trigger POST Restore Data User
                      <button title="Restore User" className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition">
                        <RefreshCw size={16} />
                      </button>
                    ) : (
                      // Trigger DEL Delete User
                      <button title="Delete (Trigger Refund)" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </UserLayout>
  );
}