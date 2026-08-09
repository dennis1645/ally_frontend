import { 
  User, Lock, Bell, Camera, Save, CheckCircle2, ShieldCheck, Mail, X
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import Card from "../../components/ui/Card";

export default function AdminProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"General" | "Security" | "Notifications">("General");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Default Form State
  const [formData, setFormData] = useState({
    fullName: "Stefanie Sugiarto",
    email: "stefanie@ally.com",
    phone: "+62 812-3456-7890",
    role: "Super Admin",
  });

  const [notifications, setNotifications] = useState({
    newMentee: true,
    paymentAlerts: true,
    systemErrors: true,
    marketingUpdates: false
  });

  // Save Action
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 animate-in fade-in duration-200">
      <div className="max-w-4xl mx-auto">
        
        {/* TOP HEADER WITH CLOSE (X) BUTTON */}
<div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
  <div>
    <h1 className="text-2xl font-bold text-slate-900">Admin Profile Settings</h1>
    <p className="text-xs text-slate-500">Manage your account details, security, and notification preferences</p>
  </div>
  
  {/* Tombol X (Warna Merah) */}
  <button 
    onClick={() => navigate(-1)} 
    className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-full transition cursor-pointer"
    title="Close & Go Back"
  >
    <X size={24} />
  </button>
</div>
          

        {/* MAIN PROFILE CARD */}
        <Card padding="lg" className="border border-slate-200 shadow-sm relative overflow-hidden bg-white">
          
          {/* SUCCESS TOAST NOTIFICATION */}
          {showSuccess && (
            <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-bold animate-in slide-in-from-top-4 fade-in duration-300 z-20">
              <CheckCircle2 size={16} /> Changes saved successfully!
            </div>
          )}

          {/* TOP HORIZONTAL BOOKMARK TABS */}
          <div className="flex border-b border-slate-200 mb-6 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("General")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer -mb-px ${
                activeTab === "General"
                  ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <User size={16} /> General Info
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("Security")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer -mb-px ${
                activeTab === "Security"
                  ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Lock size={16} /> Security & Password
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("Notifications")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer -mb-px ${
                activeTab === "Notifications"
                  ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Bell size={16} /> Notifications
            </button>
          </div>

          {/* TAB 1: GENERAL INFO */}
          {activeTab === "General" && (
            <div className="animate-in fade-in duration-200">
              <form onSubmit={handleSave} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-5 pb-4 border-b border-slate-100">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-blue-100 border-4 border-white shadow-sm flex items-center justify-center text-blue-600 text-2xl font-bold">
                      {formData.fullName.charAt(0)}
                    </div>
                    <button type="button" className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm text-slate-600 hover:text-blue-600 transition">
                      <Camera size={14} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Profile Picture</h3>
                    <p className="text-xs text-slate-500 mb-2">JPG, GIF or PNG. Max size of 2MB.</p>
                    <button type="button" className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">Upload New</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.fullName} 
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role / Title</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={formData.role} 
                        disabled
                        className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-500 cursor-not-allowed" 
                      />
                      <ShieldCheck size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                    <div className="relative">
                       <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="email" 
                         value={formData.email} 
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                         className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                         required 
                       />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-70"
                  >
                    {isSaving ? "Saving..." : <><Save size={16} /> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === "Security" && (
            <div className="animate-in fade-in duration-200 max-w-md">
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" required />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-70">
                    {isSaving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === "Notifications" && (
            <div className="animate-in fade-in duration-200">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">New Mentee Registrations</h4>
                      <p className="text-xs text-slate-500">Get notified when a new user signs up on the platform.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" checked={notifications.newMentee} onChange={() => setNotifications({...notifications, newMentee: !notifications.newMentee})} />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Payment & Top-Up Alerts</h4>
                      <p className="text-xs text-slate-500">Receive alerts for successful transactions and token purchases.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" checked={notifications.paymentAlerts} onChange={() => setNotifications({...notifications, paymentAlerts: !notifications.paymentAlerts})} />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-70">
                    {isSaving ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </form>
            </div>
          )}

        </Card>
      </div>
    </div>
  );
}