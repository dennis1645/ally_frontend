import mapBackground from "../assets/world-map.png";
import AuthCard from "../components/auth/AuthCard";
import JourneyPanel from "../components/auth/JourneyPanel";

export default function AuthPage() {
  return (
    // Menggunakan min-h-screen dengan tata letak kolom murni
    <main className="auth-page flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-slate-50 lg:flex-row">
      
      {/* Bagian Kiri: Ilustrasi Perjalanan (Sticky agar tidak ikut ter-scroll jika form kanan panjang) */}
      <div className="auth-journey-panel hidden lg:block lg:h-full lg:w-1/2">
        <JourneyPanel />
      </div>

      {/* Bagian Kanan: Form Autentikasi (Dibiarkan scroll natural) */}
      <section className="auth-form-panel relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden p-4 py-12 sm:p-10 lg:w-1/2">
        
        {/* Background Maps yang Fixed agar selalu full menutupi layar */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${mapBackground})` }}
        />
        
        {/* Efek Blur Kaca (Sekarang akan selalu full sampai bawah) */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-md" />

        <div className="auth-form-content relative z-10 flex h-full min-h-0 w-full max-w-md items-center">
          {/* Judul Muncul Khusus di Layar HP */}
          <div className="mb-8 text-center text-4xl font-black italic text-[#2563eb] drop-shadow-sm lg:hidden">
            Ally
          </div>

          {/* Wrapper untuk Form */}
          <div className="w-full">
            <AuthCard />
          </div>
        </div>
      </section>
    </main>
  );
}
