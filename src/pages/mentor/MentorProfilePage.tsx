import { useState } from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Compass,
  Edit3,
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  KeyRound,
  LayoutGrid,
  Link as LinkIcon,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Ticket,
  User,
  Users,
  X,
} from "lucide-react";
import UserLayout from "../../components/layout/UserLayout";

// ============================================================================
// LOCAL SIDEBAR ITEMS (Solusi agar tidak error import)
// ============================================================================
const mentorSidebarItems = [
  { label: "Dashboard", path: "/mentor/dashboard", icon: LayoutGrid, end: true },
  { label: "Explorer Data", path: "/mentor/mentees", icon: Users },
  { label: "Dossier", path: "/mentor/dossier", icon: ClipboardList },
  { label: "Availability & Schedule Confirmation", path: "/mentor/availability", icon: CalendarDays },
  { label: "Action Plans", path: "/mentor/action-plans", icon: Briefcase },
  { label: "Documents Library", path: "/mentor/documents", icon: BookOpen },
];

// Simulasi Data Scholarship dari Admin
const ADMIN_SCHOLARSHIPS = [
  "Select a scholarship...",
  "LPDP Reguler",
  "LPDP PTUD",
  "Chevening Scholarship",
  "Fulbright Program",
  "AAS (Australia Awards)",
  "Eiffel Excellence",
  "Erasmus Mundus",
  "MEXT Japan",
];

export function MentorProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  
  // State untuk data profil
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    phone: "083333333333",
    gender: "Not provided",
    linkedin: "Not provided",
    institution: "University of Edinburgh",
    education: "Master of Science",
    focusArea: "Business & Management",
    scholarship: "Chevening Scholarship",
    major: "Corporate Communications",
  });

  // State untuk Modal Ganti Password
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // State untuk melihat/menyembunyikan password
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Handler Upload Image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageUrl = URL.createObjectURL(e.target.files[0]);
      setProfileImage(imageUrl);
    }
  };

  // Handler Save Profile
  const handleSaveProfile = () => {
    setIsEditing(false);
    // Call API to save profile...
  };

  // Handler Submit Password (Middleware & Validation)
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    const { new: newPass, confirm } = passwordForm;

    // Validation Middleware
    if (newPass.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }
    if (!/\d/.test(newPass)) {
      setPasswordError("Password must contain at least 1 number.");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPass)) {
      setPasswordError("Password must contain at least 1 unique/special character.");
      return;
    }
    if (newPass !== confirm) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    // Jika lolos semua validasi
    setPasswordSuccess(true);
    
    // Auto-close modal setelah 2 detik
    setTimeout(() => {
      setIsPasswordModalOpen(false);
      setPasswordForm({ current: "", new: "", confirm: "" });
      setPasswordSuccess(false);
      setShowCurrentPass(false);
      setShowNewPass(false);
      setShowConfirmPass(false);
    }, 2000);
  };

  return (
    <UserLayout
      title="Mentor Profile"
      subtitle="Expedition Guide Credentials & Specifications"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          
          {/* ==============================================================
              1. HERO BOARDING PASS / EXPEDITION BADGE (TICKET STYLE)
          ============================================================== */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

            <div className="relative border-b border-slate-100 bg-slate-50/80 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ally-primary">
                <Ticket size={16} />
                <span>Expedition Guide Credentials</span>
              </div>
              
              <button
                onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold shadow-2xs transition ${
                  isEditing 
                    ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700" 
                    : "border-slate-200 bg-white text-slate-700 hover:border-ally-primary hover:text-ally-primary"
                }`}
              >
                {isEditing ? <ShieldCheck size={14} /> : <Edit3 size={13} />}
                {isEditing ? "Save Changes" : "Edit Profile"}
              </button>
            </div>

            <div className="relative p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Profile Avatar & Primary Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-6 text-center sm:text-left">
                <div className="relative group">
                  {/* Photo Frame */}
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl bg-ally-surface text-ally-primary font-black text-4xl shadow-inner border-2 border-ally-primary/20 overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Mentor Profile" className="h-full w-full object-cover" />
                    ) : (
                      "K"
                    )}
                    
                    {/* Hover Overlay for Upload (Hanya saat isEditing) */}
                    {isEditing && (
                      <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <Camera size={24} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold uppercase text-white shadow-md border-2 border-white">
                    <ShieldCheck size={12} />
                    <span>Verified</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Khalisa</h1>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 border border-slate-200">
                      ID: ALLY-3
                    </span>
                  </div>
                  <p className="text-sm font-bold text-ally-primary flex items-center justify-center sm:justify-start gap-1.5">
                    <Briefcase size={14} /> Corporate Presentation Specialist
                  </p>
                  <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                    <Globe size={13} className="text-slate-400" /> Authorized Platform Mentor & Expedition Guide
                  </p>
                </div>
              </div>

              {/* Mentee Capacity Widget */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 min-w-[240px]">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-ally-primary" /> Mentee Capacity
                  </span>
                  <span className="text-ally-primary font-black">3 / 5</span>
                </div>
                {/* 3 dari 5 = 60% */}
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-ally-primary rounded-full w-[60%]" />
                </div>
                <p className="mt-2 text-[11px] text-slate-400 italic text-center">
                  Current active explorers limit
                </p>
              </div>

            </div>

            <div className="relative flex items-center justify-between px-2">
              <div className="h-4 w-4 rounded-full bg-ally-background border-r border-slate-200 -ml-4" />
              <div className="w-full border-t-2 border-dashed border-slate-200" />
              <div className="h-4 w-4 rounded-full bg-ally-background border-l border-slate-200 -mr-4" />
            </div>

            <div className="p-4 bg-slate-50/30 flex flex-wrap items-center justify-around gap-4 text-xs font-medium text-slate-500">
              <span>Status: <strong className="text-emerald-600 font-bold">Active Guide</strong></span>
              <span>•</span>
              <span>Availability: <strong className="text-ally-primary font-bold">Open for Live Mentoring</strong></span>
            </div>
          </div>

          {/* ==============================================================
              2. BENTO GRID DETAILS (SPECIFICATIONS & CONTACT)
          ============================================================== */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* COLUMN 1: CONTACT & IDENTITY SPECS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <User size={18} className="text-ally-primary" /> Contact & Personal Specs
              </h3>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white p-2 text-slate-500 shadow-2xs">
                      <Mail size={16} />
                    </div>
                    <div className="w-full">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                      <p className="text-sm font-semibold text-slate-500">khalisa.mentor@gmail.com <span className="text-[10px] italic font-normal ml-1">(Unchangeable)</span></p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 w-full">
                    <div className="rounded-xl bg-white p-2 text-slate-500 shadow-2xs">
                      <Phone size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</p>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={profile.phone}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm mt-1 focus:border-ally-primary focus:outline-none"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-slate-800">{profile.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Gender</p>
                    {isEditing ? (
                      <div className="relative">
                        <select 
                          value={profile.gender}
                          onChange={(e) => setProfile({...profile, gender: e.target.value})}
                          className="w-full appearance-none rounded-md border border-slate-200 px-2 py-1 text-sm bg-white focus:border-ally-primary focus:outline-none pr-8"
                        >
                          <option value="Not provided">Select...</option>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-slate-800">{profile.gender}</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">LinkedIn</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={profile.linkedin === "Not provided" ? "" : profile.linkedin}
                        onChange={(e) => setProfile({...profile, linkedin: e.target.value})}
                        placeholder="Link to your LinkedIn"
                        className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-ally-primary focus:outline-none"
                      />
                    ) : (
                      <a href={profile.linkedin === "Not provided" || profile.linkedin.trim() === "" ? "#" : profile.linkedin} className="text-sm font-semibold text-ally-primary flex items-center gap-1 hover:underline truncate">
                        <LinkIcon size={14} /> {profile.linkedin === "Not provided" || profile.linkedin.trim() === "" ? "Not provided" : "Profile Link"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: ACADEMIC & GUIDANCE SPECS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Compass size={18} className="text-ally-primary" /> Guidance & Navigation Specs
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <GraduationCap size={15} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Institution</span>
                  </div>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.institution}
                      onChange={(e) => setProfile({...profile, institution: e.target.value})}
                      className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-ally-primary focus:outline-none"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 truncate">{profile.institution}</p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Award size={15} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Education Level</span>
                  </div>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.education}
                      onChange={(e) => setProfile({...profile, education: e.target.value})}
                      className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-ally-primary focus:outline-none"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 truncate">{profile.education}</p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Compass size={15} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Focus Area</span>
                  </div>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.focusArea}
                      onChange={(e) => setProfile({...profile, focusArea: e.target.value})}
                      className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-ally-primary focus:outline-none"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 truncate">{profile.focusArea}</p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <BookOpen size={15} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Major/Program</span>
                  </div>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.major}
                      onChange={(e) => setProfile({...profile, major: e.target.value})}
                      className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-ally-primary focus:outline-none"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 truncate">{profile.major}</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 flex items-center justify-between">
                <div className="w-full">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Awardee Of (Scholarship)</p>
                  {isEditing ? (
                    <div className="relative">
                      <select 
                        value={profile.scholarship}
                        onChange={(e) => setProfile({...profile, scholarship: e.target.value})}
                        className="w-full appearance-none rounded-md border border-slate-200 px-3 py-1.5 text-sm bg-white focus:border-ally-primary focus:outline-none pr-8 cursor-pointer"
                      >
                        {ADMIN_SCHOLARSHIPS.map((schol) => (
                          <option key={schol} value={schol}>{schol}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800 truncate">{profile.scholarship}</p>
                      <span className="rounded-full bg-ally-surface px-3 py-1 text-xs font-bold text-ally-primary whitespace-nowrap ml-2">
                        Verified Awardee
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ==============================================================
                3. SECURITY / AUTHENTICATION SECTION
            ============================================================== */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 md:col-span-2">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <KeyRound size={18} className="text-ally-primary" /> Security & Authentication
              </h3>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">Account Password</p>
                  <p className="text-xs text-slate-500 mt-0.5">Ensure your account is using a long, random password to stay secure.</p>
                </div>
                <button
                  onClick={() => {
                    setIsPasswordModalOpen(true);
                    setPasswordError("");
                    setPasswordSuccess(false);
                    setPasswordForm({ current: "", new: "", confirm: "" });
                    setShowCurrentPass(false);
                    setShowNewPass(false);
                    setShowConfirmPass(false);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-800 px-5 py-2 text-xs font-bold text-white transition hover:bg-slate-700"
                >
                  <Lock size={14} /> Change Password
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ==============================================================
            MODAL: CHANGE PASSWORD
        ============================================================== */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
              
              <button 
                onClick={() => {
                  setIsPasswordModalOpen(false);
                }}
                className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="text-ally-primary" /> Change Password
              </h3>
              <p className="text-sm text-slate-500 mt-1 mb-6">Create a strong password (min. 8 chars, 1 number, 1 special char).</p>

              {/* SUCCESS MESSAGE */}
              {passwordSuccess ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4">
                  <CheckCircle2 size={40} className="text-emerald-500 mb-3" />
                  <p className="text-emerald-800 font-bold text-lg">Success!</p>
                  <p className="text-emerald-600 text-sm mt-1">Your password has successfully changed.</p>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {/* ERROR MESSAGE */}
                  {passwordError && (
                    <div className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-600 border border-rose-100">
                      {passwordError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        required
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-ally-primary focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        required
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-ally-primary focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        required
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-ally-primary focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(false)}
                      className="flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-full bg-slate-900 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </section>
    </UserLayout>
  );
}

export default MentorProfilePage;