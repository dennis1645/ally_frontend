import { 
  Building2, Award, Search, Edit2, Trash2, 
  Plus, RotateCcw, X, MapPin, Globe2, Loader2
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- FIX LEAFLET MARKER ICON ---
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

import Card from "../../components/ui/Card";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";

// --- MASTER DATA BEASISWA (Simulasi tarikan dari Scholarship Page) ---
const AVAILABLE_SCHOLARSHIPS = [
  "LPDP", "DAAD", "Erasmus+", "Eiffel", "Chevening", 
  "MEXT", "AAS", "Fulbright", "StuNed", "ESOP", "GKS", "BPI"
];

// --- KOMPONEN PENGONTROL ZOOM PETA ---
function MapController({ center, zoom }: { center: [number, number] | null, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 }); 
    } else {
      map.flyTo([48.8566, 2.3522], 3, { duration: 1.5 }); 
    }
  }, [center, zoom, map]);
  return null;
}

// --- FUNGSI GEOCODING OTOMATIS (Tanpa API Key) ---
async function fetchCoordinates(city: string, country: string): Promise<{lat: number, lng: number} | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&format=json&limit=1`);
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch (error) {
    console.error("Gagal mengambil koordinat:", error);
    return null;
  }
}

// --- TIPE & MOCK DATA ---
interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  region: "Europe" | "Asia" | "North America" | "Australia";
  lat: number;
  lng: number;
  qsRank: number;
  scholarships: string[];
  interestedMentees: number;
  status: "Active" | "Archived";
}

const INITIAL_UNIVERSITIES: University[] = [
  { id: "UNIV-01", name: "Technical University of Munich", country: "Germany", city: "Munich", region: "Europe", lat: 48.1497, lng: 11.5680, qsRank: 28, scholarships: ["DAAD", "LPDP"], interestedMentees: 512, status: "Active" },
  { id: "UNIV-06", name: "Heidelberg University", country: "Germany", city: "Heidelberg", region: "Europe", lat: 49.4094, lng: 8.6736, qsRank: 87, scholarships: ["DAAD"], interestedMentees: 120, status: "Active" },
  { id: "UNIV-02", name: "ETH Zurich", country: "Switzerland", city: "Zurich", region: "Europe", lat: 47.3763, lng: 8.5480, qsRank: 7, scholarships: ["ESOP", "LPDP"], interestedMentees: 340, status: "Active" },
  { id: "UNIV-03", name: "Sorbonne University", country: "France", city: "Paris", region: "Europe", lat: 48.8484, lng: 2.3431, qsRank: 59, scholarships: ["Eiffel"], interestedMentees: 215, status: "Active" },
  { id: "UNIV-04", name: "The University of Tokyo", country: "Japan", city: "Tokyo", region: "Asia", lat: 35.7126, lng: 139.7620, qsRank: 28, scholarships: ["MEXT", "LPDP"], interestedMentees: 180, status: "Active" }
];

export default function UniversityManagement() {
  const [universities, setUniversities] = useState<University[]>(INITIAL_UNIVERSITIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Archived">("All");
  
  const [mapSelectedCountry, setMapSelectedCountry] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newUniv, setNewUniv] = useState<Partial<University>>({ region: "Europe", scholarships: [] });
  const [editingUniv, setEditingUniv] = useState<University | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FILTER & CALCULATIONS ---
  const filteredUniversities = useMemo(() => {
    return universities.filter(univ => {
      const matchesSearch = univ.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            univ.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            univ.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "Archived" ? univ.status === "Archived" : univ.status === "Active";
      const matchesMapCountry = mapSelectedCountry ? univ.country === mapSelectedCountry : true;
      return matchesSearch && matchesTab && matchesMapCountry;
    });
  }, [universities, searchQuery, activeTab, mapSelectedCountry]);

  const totalActive = universities.filter(u => u.status === "Active").length;
  const mostDemanded = useMemo(() => {
    return [...universities.filter(u => u.status === "Active")].sort((a, b) => b.interestedMentees - a.interestedMentees)[0];
  }, [universities]);

  // --- ACTIONS ---
  const handleMapPinClick = (univ: University) => {
    setMapSelectedCountry(univ.country);
    setMapCenter([univ.lat, univ.lng]);
  };

  const clearMapFilter = () => {
    setMapSelectedCountry(null);
    setMapCenter(null);
  };

  const handleAddNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const city = newUniv.city || "";
    const country = newUniv.country || "";
    const coords = await fetchCoordinates(city, country);
    
    const univToAdd: University = {
      id: `UNIV-NEW-${Date.now()}`,
      name: newUniv.name || "",
      country: country,
      city: city,
      region: newUniv.region as any,
      qsRank: newUniv.qsRank || 0,
      lat: coords ? coords.lat : 0, 
      lng: coords ? coords.lng : 0, 
      scholarships: newUniv.scholarships || [],
      interestedMentees: 0,
      status: "Active"
    };

    if (!coords) {
       alert(`Sistem gagal menemukan koordinat presisi untuk kota ${city}, ${country}. Universitas disimpan namun pin peta mungkin di tengah laut.`);
    }

    setUniversities([univToAdd, ...universities]);
    setIsAddingNew(false);
    setNewUniv({ region: "Europe", scholarships: [] });
    setIsSubmitting(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUniv) return;
    setIsSubmitting(true);

    // Kalau admin ganti nama kota, kita cari koordinat barunya
    let updatedLat = editingUniv.lat;
    let updatedLng = editingUniv.lng;
    const oldUnivData = universities.find(u => u.id === editingUniv.id);
    
    if (oldUnivData && (oldUnivData.city !== editingUniv.city || oldUnivData.country !== editingUniv.country)) {
       const coords = await fetchCoordinates(editingUniv.city, editingUniv.country);
       if (coords) {
         updatedLat = coords.lat;
         updatedLng = coords.lng;
       }
    }

    const updatedUniv = {
       ...editingUniv,
       lat: updatedLat,
       lng: updatedLng
    };

    setUniversities(prev => prev.map(u => u.id === editingUniv.id ? updatedUniv : u));
    setEditingUniv(null);
    setIsSubmitting(false);
  };

  const executeSoftDelete = () => {
    if (deleteConfirmId) {
      setUniversities(prev => prev.map(u => u.id === deleteConfirmId ? { ...u, status: "Archived" } : u));
      setDeleteConfirmId(null);
    }
  };

  const handleRestore = (id: string) => {
    setUniversities(prev => prev.map(u => u.id === id ? { ...u, status: "Active" } : u));
  };

  return (
    <UserLayout title="University Management" subtitle="MANAGE TARGET UNIVERSITIES AND SCHOLARSHIP ASSOCIATIONS" sidebarItems={adminSidebarItems} topbarProps={{ showSearch: false }}>
      <section className="bg-slate-50 p-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-6 flex justify-end">
            <button onClick={() => setIsAddingNew(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
              <Plus size={15} /><span>Add New University</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <Card padding="md" className="border border-slate-100 shadow-sm relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Active</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{totalActive}</div>
                </div>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Building2 size={20} /></div>
              </div>
            </Card>
            <Card padding="md" className="border border-slate-100 shadow-sm relative">
              <div className="flex justify-between items-start">
                <div className="w-full pr-10">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Most Demanded</span>
                  <div className="text-sm font-bold text-slate-900 mt-1 leading-tight line-clamp-2">{mostDemanded?.name || "N/A"}</div>
                  <span className="text-xs text-indigo-600 font-medium block mt-1">{mostDemanded?.interestedMentees || 0} Mentees</span>
                </div>
                <div className="absolute right-4 top-4 p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Award size={20} /></div>
              </div>
            </Card>
          </div>

          <Card padding="none" className="border border-slate-100 shadow-sm mb-6 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 relative">
              <div className="flex items-center gap-2">
                <Globe2 size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Global Coverage Map</h3>
              </div>
              {mapSelectedCountry && (
                <button onClick={clearMapFilter} className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition">
                  Clear "{mapSelectedCountry}" Filter
                </button>
              )}
            </div>
            <div className="h-80 w-full z-0 relative">
              <MapContainer center={[48.8566, 2.3522]} zoom={3} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapController center={mapCenter} zoom={mapCenter ? 6 : 3} />
                {universities.filter(u => u.status === 'Active').map((univ) => (
                  <Marker key={univ.id} position={[univ.lat, univ.lng]} eventHandlers={{ click: () => handleMapPinClick(univ) }}>
                    <Popup>
                      <div className="text-xs text-center p-1">
                        <strong className="block text-slate-900 font-bold">{univ.name}</strong>
                        <span className="text-slate-500">{univ.city}, {univ.country}</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </Card>

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden z-10 relative">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex gap-2">
                <button onClick={() => setActiveTab("All")} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'All' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>Active ({universities.filter(u => u.status === 'Active').length})</button>
                <button onClick={() => setActiveTab("Archived")} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'Archived' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>Archived</button>
              </div>
              <div className="relative flex-1 sm:max-w-xs">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search university or location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-4">University Name</th><th className="p-4">Location</th><th className="p-4 text-center">QS Rank</th><th className="p-4">Linked Scholarships</th><th className="p-4 text-center">Interested Mentees</th><th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredUniversities.length > 0 ? filteredUniversities.map((univ) => (
                    <tr key={univ.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4"><div className="font-semibold text-slate-900">{univ.name}</div><span className="text-xs text-slate-400 font-mono">{univ.id}</span></td>
                      <td className="p-4"><div className="font-medium text-slate-800 flex items-center gap-1"><MapPin size={13} className="text-slate-400" /><span>{univ.city}, {univ.country}</span></div></td>
                      <td className="p-4 text-center"><span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">#{univ.qsRank}</span></td>
                      <td className="p-4"><div className="flex flex-wrap gap-1">{univ.scholarships.map((s, idx) => (<span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-medium rounded-md">{s}</span>))}</div></td>
                      <td className="p-4 text-center font-bold text-slate-900">{univ.interestedMentees}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {univ.status === 'Active' ? (
                            <><button onClick={() => setEditingUniv(univ)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit2 size={16} /></button><button onClick={() => setDeleteConfirmId(univ.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button></>
                          ) : (
                            <button onClick={() => handleRestore(univ.id)} className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold"><RotateCcw size={13} /><span>Restore</span></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={6} className="p-8 text-center text-slate-400">No universities found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* --- MODAL: ADD NEW UNIVERSITY --- */}
      {isAddingNew && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setIsAddingNew(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New University</h3>
            <form onSubmit={handleAddNewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">University Name</label>
                <input type="text" value={newUniv.name || ""} onChange={(e) => setNewUniv({...newUniv, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required disabled={isSubmitting}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                  <input type="text" value={newUniv.city || ""} onChange={(e) => setNewUniv({...newUniv, city: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required disabled={isSubmitting}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Country</label>
                  <input type="text" value={newUniv.country || ""} onChange={(e) => setNewUniv({...newUniv, country: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required disabled={isSubmitting}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">QS Rank</label>
                  <input type="number" value={newUniv.qsRank || ""} onChange={(e) => setNewUniv({...newUniv, qsRank: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" required disabled={isSubmitting}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Region</label>
                  <select value={newUniv.region} onChange={(e) => setNewUniv({...newUniv, region: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white" disabled={isSubmitting}>
                    <option value="Europe">Europe</option><option value="Asia">Asia</option><option value="North America">North America</option><option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
              
              {/* --- LINKED SCHOLARSHIPS MULTI-SELECT --- */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Linked Scholarships</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SCHOLARSHIPS.map(scholarship => {
                    const isSelected = newUniv.scholarships?.includes(scholarship);
                    return (
                      <button
                        type="button"
                        key={scholarship}
                        disabled={isSubmitting}
                        onClick={() => {
                          const current = newUniv.scholarships || [];
                          const updated = isSelected 
                            ? current.filter(s => s !== scholarship) // Hapus kalau udah ada
                            : [...current, scholarship]; // Tambah kalau belum ada
                          setNewUniv({ ...newUniv, scholarships: updated });
                        }}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold border transition ${
                          isSelected 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        {scholarship}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsAddingNew(false)} className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  {isSubmitting ? "Finding Location..." : "Add University"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT UNIVERSITY --- */}
      {editingUniv && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setEditingUniv(null)} className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit University Data</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">University Name</label>
                <input type="text" value={editingUniv.name} onChange={(e) => setEditingUniv({...editingUniv, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required disabled={isSubmitting}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                  <input type="text" value={editingUniv.city} onChange={(e) => setEditingUniv({...editingUniv, city: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required disabled={isSubmitting}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Country</label>
                  <input type="text" value={editingUniv.country} onChange={(e) => setEditingUniv({...editingUniv, country: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required disabled={isSubmitting}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">QS Rank</label>
                  <input type="number" value={editingUniv.qsRank} onChange={(e) => setEditingUniv({...editingUniv, qsRank: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" required disabled={isSubmitting}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Region</label>
                  <select value={editingUniv.region} onChange={(e) => setEditingUniv({...editingUniv, region: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white" disabled={isSubmitting}>
                    <option value="Europe">Europe</option><option value="Asia">Asia</option><option value="North America">North America</option><option value="Australia">Australia</option>
                  </select>
                </div>
              </div>

              {/* --- LINKED SCHOLARSHIPS MULTI-SELECT --- */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Linked Scholarships</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SCHOLARSHIPS.map(scholarship => {
                    const isSelected = editingUniv.scholarships.includes(scholarship);
                    return (
                      <button
                        type="button"
                        key={scholarship}
                        disabled={isSubmitting}
                        onClick={() => {
                          const current = editingUniv.scholarships;
                          const updated = isSelected 
                            ? current.filter(s => s !== scholarship) 
                            : [...current, scholarship]; 
                          setEditingUniv({ ...editingUniv, scholarships: updated });
                        }}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold border transition ${
                          isSelected 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        {scholarship}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <button type="button" onClick={() => setEditingUniv(null)} className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* --- MODAL CONFIRM DELETE --- */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                 <Trash2 size={24} className="text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Archive University?</h3>
              <p className="text-sm text-slate-500 mb-6">Are you sure you want to archive this university from the active list?</p>
              <div className="flex justify-center gap-3">
                 <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm">Cancel</button>
                 <button onClick={executeSoftDelete} className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg text-sm shadow-sm">Yes, Archive It</button>
              </div>
           </div>
        </div>
      )}

    </UserLayout>
  );
}