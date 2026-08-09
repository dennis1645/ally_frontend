import { useState } from "react";
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus, 
  Eye, 
  Trash2, 
  RefreshCw, 
  ShieldAlert,
  X,
  Ban,
  PlayCircle,
  AlertTriangle,
  Check
} from "lucide-react";

import { type AdminUser } from "../../api/adminApi";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";

// Extended mock type
interface ExtendedAdminUser extends AdminUser {
  status?: "Active" | "Suspended" | "Pending" | "Inactive" | "Rejected";
  isDeleted?: boolean;
  plan?: "Free" | "Medium" | "Premium";
  assignedMentor?: string | null;
  mentorTokens?: number;
  suspendReason?: string;
  mentees?: {
    id: string;
    name: string;
    email: string;
    plan: "Free" | "Medium" | "Premium";
    status: "Active" | "Inactive";
  }[];
}

// --- RICH DUMMY DATA FOR PREVIEW ---
const INITIAL_DUMMY_USERS: ExtendedAdminUser[] = [
  {
    id: "usr-1",
    name: "Dr. Ahmad Fauzi, M.Sc",
    email: "ahmad.fauzi@platform.com",
    role: "Mentor",
    status: "Active",
    mentees: [
      { id: "m-101", name: "Rina Putri", email: "rina.putri@email.com", plan: "Premium", status: "Active" },
      { id: "m-102", name: "Dimas Anggara", email: "dimas.ang@email.com", plan: "Medium", status: "Inactive" },
    ]
  },
  {
    id: "usr-2",
    name: "Sarah Jenkins",
    email: "sarah.j@email.com",
    role: "Mentee",
    status: "Active",
    plan: "Premium",
    assignedMentor: "Dr. Ahmad Fauzi, M.Sc",
    mentorTokens: 3
  },
  {
    id: "usr-3",
    name: "Kevin Santoso",
    email: "kevin.santoso@platform.com",
    role: "Mentor",
    status: "Pending",
    mentees: []
  },
  {
    id: "usr-4",
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    role: "Mentee",
    status: "Suspended",
    plan: "Free",
    assignedMentor: null,
    mentorTokens: 0,
    suspendReason: "Violation of community guidelines."
  },
  {
    id: "usr-5",
    name: "Prof. Maria Wijaya",
    email: "maria.wijaya@platform.com",
    role: "Mentor",
    status: "Active",
    mentees: [
      { id: "m-104", name: "Fikri Haikal", email: "fikri.h@email.com", plan: "Premium", status: "Active" }
    ]
  },
  {
    id: "usr-7",
    name: "Rahmat Hidayat",
    email: "rahmat.h@platform.com",
    role: "Mentor",
    status: "Pending",
    mentees: []
  },
  {
    id: "usr-8",
    name: "Alex Turner",
    email: "alex.turner@email.com",
    role: "Mentee",
    status: "Inactive",
    isDeleted: true,
    plan: "Free",
    assignedMentor: null,
    mentorTokens: 0
  }
];

export default function UserManagement() {
  const [users, setUsers] = useState<ExtendedAdminUser[]>(INITIAL_DUMMY_USERS);

  // States for Tabs and Filters
  const [activeTab, setActiveTab] = useState<"All" | "Mentees" | "Mentors">("All");
  const [statusFilter, setStatusFilter] = useState<string>("All"); 

  // States for Details Drawer
  const [selectedUser, setSelectedUser] = useState<ExtendedAdminUser | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // States for Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"Mentor" | "Mentee">("Mentor");
  const [newUserPlan, setNewUserPlan] = useState<"Free" | "Medium" | "Premium">("Free");

  const [userToApprove, setUserToApprove] = useState<ExtendedAdminUser | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const [userToDelete, setUserToDelete] = useState<ExtendedAdminUser | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [userToRestore, setUserToRestore] = useState<ExtendedAdminUser | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const [userToSuspend, setUserToSuspend] = useState<ExtendedAdminUser | null>(null);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  const [userToReject, setUserToReject] = useState<ExtendedAdminUser | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const [userToReactivate, setUserToReactivate] = useState<ExtendedAdminUser | null>(null);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);

  const handleCardClick = (targetStatus: string, targetTab: "All" | "Mentees" | "Mentors") => {
    if (statusFilter === targetStatus) {
      setStatusFilter("All");
      setActiveTab("All");
    } else {
      setStatusFilter(targetStatus);
      setActiveTab(targetTab);
    }
  };

  // --- ACTIONS LOGIC ---

  // 1. Add New User Submission
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: ExtendedAdminUser = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: "Active",
      plan: newUserRole === "Mentee" ? newUserPlan : undefined,
      mentees: newUserRole === "Mentor" ? [] : undefined,
      mentorTokens: newUserRole === "Mentee" ? 3 : undefined,
    };

    setUsers([newUser, ...users]);
    setIsAddUserModalOpen(false);
    // Reset Form
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("Mentor");
    setNewUserPlan("Free");
  };

  // 2. Approve Pending User (With Modal)
  const confirmApproveUser = () => {
    if (userToApprove) {
      setUsers(users.map(u => u.id === userToApprove.id ? { ...u, status: "Active" } : u));
      setIsApproveModalOpen(false);
      setUserToApprove(null);
    }
  };

  // 3. Reject Pending User
  const confirmRejectUser = () => {
    if (userToReject) {
      setUsers(users.map(u => u.id === userToReject.id ? { ...u, status: "Rejected", isDeleted: true } : u));
      setIsRejectModalOpen(false);
      setUserToReject(null);
    }
  };

  // 4. Reactivate Suspended User
  const confirmReactivateUser = () => {
    if (userToReactivate) {
      setUsers(users.map(u => u.id === userToReactivate.id ? { ...u, status: "Active", suspendReason: undefined } : u));
      setIsReactivateModalOpen(false);
      setUserToReactivate(null);
    }
  };

  // 5. Delete Active/Inactive User
  const confirmDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.map(u => u.id === userToDelete.id ? { ...u, isDeleted: true, status: "Inactive" } : u));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  // 6. Restore Deleted User
  const confirmRestoreUser = () => {
    if (userToRestore) {
      const restoredStatus = userToRestore.status === "Rejected" ? "Pending" : "Active";
      setUsers(users.map(u => u.id === userToRestore.id ? { ...u, isDeleted: false, status: restoredStatus } : u));
      setIsRestoreModalOpen(false);
      setUserToRestore(null);
    }
  };

  // 7. Suspend Active User
  const confirmSuspendUser = () => {
    if (userToSuspend) {
      setUsers(users.map(u => u.id === userToSuspend.id ? { ...u, status: "Suspended", suspendReason } : u));
      setIsSuspendModalOpen(false);
      setUserToSuspend(null);
      setSuspendReason("");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (activeTab === "Mentees" && user.role !== "Mentee") return false;
    if (activeTab === "Mentors" && user.role !== "Mentor") return false;
    if (statusFilter === "Active" && user.status !== "Active") return false;
    if (statusFilter === "Suspended" && user.status !== "Suspended") return false;
    if (statusFilter === "Pending" && user.status !== "Pending") return false;
    return true;
  });

  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.status === 'Active' && !u.isDeleted).length;
  const suspendedUsersCount = users.filter(u => u.status === 'Suspended' && !u.isDeleted).length;
  const pendingMentorsCount = users.filter(u => u.role === 'Mentor' && u.status === 'Pending' && !u.isDeleted).length;

  return (
    <UserLayout
      title="User Management"
      subtitle="Manage platform mentees and mentors"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <div className="p-6 bg-gray-50 min-h-[calc(100vh-80px)] relative">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-sm text-gray-500">Manage platform mentees and mentors database.</p>
          </div>
          <button 
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <UserPlus size={18} />
            <span>Add New User</span>
          </button>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-gray-200 mb-6 pb-2">
          <button onClick={() => { setActiveTab("All"); setStatusFilter("All"); }} className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'All' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>All Users ({totalUsersCount})</button>
          <button onClick={() => { setActiveTab("Mentees"); setStatusFilter("All"); }} className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'Mentees' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>Mentees</button>
          <button onClick={() => { setActiveTab("Mentors"); setStatusFilter("All"); }} className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'Mentors' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>Mentors</button>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div onClick={() => handleCardClick("Active", "All")} className={`bg-white p-5 rounded-xl border transition cursor-pointer shadow-sm flex items-center gap-4 ${statusFilter === 'Active' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-200'}`}>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><UserCheck size={22} /></div>
            <div><p className="text-xs font-semibold text-gray-400 uppercase">Active Users</p><h3 className="text-xl font-bold text-gray-800">{activeUsersCount}</h3></div>
          </div>
          <div onClick={() => handleCardClick("Pending", "Mentors")} className={`bg-white p-5 rounded-xl border transition cursor-pointer shadow-sm flex items-center gap-4 ${statusFilter === 'Pending' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-gray-100 hover:border-gray-200'}`}>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><ShieldAlert size={22} /></div>
            <div><p className="text-xs font-semibold text-gray-400 uppercase">Pending Approvals</p><h3 className="text-xl font-bold text-gray-800">{pendingMentorsCount}</h3></div>
          </div>
          <div onClick={() => handleCardClick("Suspended", "All")} className={`bg-white p-5 rounded-xl border transition cursor-pointer shadow-sm flex items-center gap-4 ${statusFilter === 'Suspended' ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-100 hover:border-gray-200'}`}>
            <div className="p-3 bg-red-50 text-red-600 rounded-lg"><UserX size={22} /></div>
            <div><p className="text-xs font-semibold text-gray-400 uppercase">Suspended Users</p><h3 className="text-xl font-bold text-gray-800">{suspendedUsersCount}</h3></div>
          </div>
          <div onClick={() => handleCardClick("All", "All")} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-gray-200">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={22} /></div>
            <div><p className="text-xs font-semibold text-gray-400 uppercase">Total Database</p><h3 className="text-xl font-bold text-gray-800">{totalUsersCount}</h3></div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">User Profile</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-gray-400">
                      No users found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className={`transition ${user.isDeleted ? 'bg-gray-100/60 opacity-60 grayscale' : 'hover:bg-gray-50/80'}`}>
                      <td className="p-4 text-sm text-gray-800 font-medium">
                        <div className="flex items-center gap-2">
                          <span 
                            onClick={() => { if (user.status !== 'Pending') { setSelectedUser(user); setIsDrawerOpen(true); } }}
                            className={`${user.status !== 'Pending' ? 'cursor-pointer hover:text-blue-600 hover:underline' : 'text-gray-700'}`}
                          >
                            {user.name}
                          </span>
                          
                          {/* Badges */}
                          {user.isDeleted && (
                            <span className="text-[10px] text-gray-600 bg-gray-200 px-2 py-0.5 rounded font-medium">Deleted</span>
                          )}
                          
                          {user.role === 'Mentor' && user.mentees && !user.isDeleted && (
                            <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-normal">
                              {user.mentees.length} Mentees
                            </span>
                          )}

                          {user.role === 'Mentee' && user.plan && !user.isDeleted && (
                            <span className={`text-[10px] px-2 py-0.5 rounded font-normal ${
                              user.plan === 'Premium' ? 'text-purple-600 bg-purple-50' :
                              user.plan === 'Medium' ? 'text-emerald-600 bg-emerald-50' :
                              'text-slate-600 bg-slate-100'
                            }`}>
                              {user.plan} Plan
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{user.email}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'Mentor' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 
                          user.status === 'Suspended' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 
                          user.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                          user.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-gray-100 text-gray-600 border border-gray-300'
                        }`}>
                          {user.status ?? '—'}
                        </span>
                      </td>
                      <td className="p-4 flex items-center justify-center gap-2">
                        
                        {/* CONDITIONAL RENDERING ACTIONS BERDASARKAN STATUS */}
                        {user.status === 'Pending' ? (
                          // TAMPILAN KHUSUS PENDING (Approve pake modal & Reject pake modal)
                          <>
                            <button 
                              title="Approve User" 
                              onClick={() => { setUserToApprove(user); setIsApproveModalOpen(true); }}
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-lg transition"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              title="Reject User" 
                              onClick={() => { setUserToReject(user); setIsRejectModalOpen(true); }}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          // TAMPILAN NORMAL (View, Suspend, Delete/Restore)
                          <>
                            <button 
                              title="View Profile Details" 
                              onClick={() => { setSelectedUser(user); setIsDrawerOpen(true); }}
                              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition"
                            >
                              <Eye size={16} />
                            </button>
                            
                            {!user.isDeleted && (
                              user.status === 'Suspended' ? (
                                <button 
                                  title="Reactivate User" 
                                  onClick={() => { setUserToReactivate(user); setIsReactivateModalOpen(true); }}
                                  className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-lg transition"
                                >
                                  <PlayCircle size={16} />
                                </button>
                              ) : (
                                <button 
                                  title="Suspend User" 
                                  onClick={() => { setUserToSuspend(user); setIsSuspendModalOpen(true); }}
                                  className="p-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 rounded-lg transition"
                                >
                                  <Ban size={16} />
                                </button>
                              )
                            )}

                            {user.isDeleted ? (
                              <button 
                                title="Restore User" 
                                onClick={() => { setUserToRestore(user); setIsRestoreModalOpen(true); }}
                                className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-lg transition"
                              >
                                <RefreshCw size={16} />
                              </button>
                            ) : (
                              <button 
                                title="Delete User" 
                                onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }}
                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- UNIVERSAL DETAIL DRAWER --- */}
        {isDrawerOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-gray-100">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <div>
                    <span className={`text-xs uppercase font-semibold px-2 py-0.5 rounded ${selectedUser.role === 'Mentor' ? 'text-purple-600 bg-purple-50' : 'text-blue-600 bg-blue-50'}`}>
                      {selectedUser.role} Profile
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 mt-1">{selectedUser.name}</h2>
                    <p className="text-xs text-gray-500">{selectedUser.email}</p>
                  </div>
                  <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
                    <X size={20} />
                  </button>
                </div>

                {selectedUser.status === 'Suspended' && selectedUser.suspendReason && (
                  <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-orange-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-orange-800">Account Suspended</p>
                      <p className="text-sm text-orange-600 mt-1">{selectedUser.suspendReason}</p>
                    </div>
                  </div>
                )}

                {selectedUser.role === 'Mentor' && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Total Mentees Assigned</p>
                      <p className="text-2xl font-bold text-gray-900 mt-0.5">{selectedUser.mentees?.length ?? 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium">Verification Status</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${selectedUser.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'} border`}>
                        {selectedUser.status === 'Active' ? 'Verified Expert' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                )}

                {selectedUser.role === 'Mentee' && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">Subscription Plan</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">{selectedUser.plan || 'Free'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">Account Status</p>
                      <p className={`text-sm font-semibold mt-1.5 ${
                        selectedUser.status === 'Active' ? 'text-green-600' : 
                        selectedUser.status === 'Suspended' ? 'text-orange-600' : 
                        'text-gray-500'
                      }`}>
                        {selectedUser.status}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 mt-6">
                <button onClick={() => setIsDrawerOpen(false)} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition">
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD NEW USER FORM (BARU) */}
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
              <button onClick={() => setIsAddUserModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
              
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4"><UserPlus size={24} className="text-blue-600" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Add New User</h3>
              <p className="text-sm text-gray-500 mb-4">Fill out the details below to add a new mentor or mentee.</p>

              <form onSubmit={handleAddUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Dr. Budi Santoso"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email Address</label>
                  <input 
                    type="email"
                    required
                    placeholder="e.g. budi.santoso@platform.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">User Role</label>
                  <select 
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as "Mentor" | "Mentee")}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="Mentor">Mentor</option>
                    <option value="Mentee">Mentee</option>
                  </select>
                </div>

                {newUserRole === 'Mentee' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Subscription Plan</label>
                    <select 
                      value={newUserPlan}
                      onChange={(e) => setNewUserPlan(e.target.value as "Free" | "Medium" | "Premium")}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      <option value="Free">Free Plan</option>
                      <option value="Medium">Medium Plan</option>
                      <option value="Premium">Premium Plan</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm">Add User</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: APPROVE CONFIRMATION (BARU) */}
        {isApproveModalOpen && userToApprove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
              <button onClick={() => setIsApproveModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4"><Check size={24} className="text-green-600" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Approve User?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to approve <span className="font-semibold text-gray-700">{userToApprove.name}</span>? Their account status will become active.</p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setIsApproveModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button onClick={confirmApproveUser} className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition shadow-sm">Yes, Approve</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: DELETE CONFIRMATION */}
        {isDeleteModalOpen && userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
              <button onClick={() => setIsDeleteModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4"><Trash2 size={24} className="text-red-600" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <span className="font-semibold text-gray-700">{userToDelete.name}</span>? Their status will be set to inactive.</p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button onClick={confirmDeleteUser} className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow-sm">Yes, Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: REJECT PENDING USER CONFIRMATION */}
        {isRejectModalOpen && userToReject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
              <button onClick={() => setIsRejectModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4"><X size={24} className="text-red-600" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Application?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to reject the application for <span className="font-semibold text-gray-700">{userToReject.name}</span>?</p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button onClick={confirmRejectUser} className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow-sm">Yes, Reject</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: RESTORE CONFIRMATION */}
        {isRestoreModalOpen && userToRestore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
              <button onClick={() => setIsRestoreModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4"><RefreshCw size={24} className="text-green-600" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Restore User?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to restore <span className="font-semibold text-gray-700">{userToRestore.name}</span>?</p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setIsRestoreModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button onClick={confirmRestoreUser} className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition shadow-sm">Yes, Restore</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: REACTIVATE CONFIRMATION */}
        {isReactivateModalOpen && userToReactivate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
              <button onClick={() => setIsReactivateModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4"><PlayCircle size={24} className="text-emerald-600" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Reactivate User?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to reactivate <span className="font-semibold text-gray-700">{userToReactivate.name}</span>? Their account will be active again and the suspension will be lifted.</p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setIsReactivateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button onClick={confirmReactivateUser} className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm">Yes, Reactivate</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: SUSPEND CONFIRMATION WITH REASON */}
        {isSuspendModalOpen && userToSuspend && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
              <button onClick={() => setIsSuspendModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-4"><Ban size={24} className="text-orange-600" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Suspend Account</h3>
              <p className="text-sm text-gray-500 mb-4">You are about to suspend <span className="font-semibold text-gray-700">{userToSuspend.name}</span>. Please provide a reason.</p>
              
              <textarea 
                rows={3}
                placeholder="Enter reason for suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm mb-6 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              />

              <div className="flex items-center justify-end gap-3">
                <button onClick={() => { setIsSuspendModalOpen(false); setSuspendReason(""); }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button 
                  onClick={confirmSuspendUser} 
                  disabled={!suspendReason.trim()}
                  className="px-4 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition shadow-sm"
                >
                  Confirm Suspend
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </UserLayout>
  );
}