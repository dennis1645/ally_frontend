import mapBackground from "../assets/world-map.png";
import AuthCard from "../components/auth/AuthCard";
import JourneyPanel from "../components/auth/JourneyPanel";

export default function AuthPage() {
  return (
    // Menggunakan min-h-screen dengan tata letak kolom murni
    <main className="flex min-h-screen w-full flex-col lg:flex-row bg-slate-50">
      
      {/* Bagian Kiri: Ilustrasi Perjalanan (Sticky agar tidak ikut ter-scroll jika form kanan panjang) */}
      <div className="hidden lg:block lg:w-1/2 lg:sticky lg:top-0 lg:h-screen">
        <JourneyPanel />
      </div>

      {/* Bagian Kanan: Form Autentikasi (Dibiarkan scroll natural) */}
      <section className="relative flex w-full lg:w-1/2 min-h-screen items-center justify-center p-4 py-12 sm:p-10">
        
        {/* Background Maps yang Fixed agar selalu full menutupi layar */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${mapBackground})` }}
        />
        
        {/* Efek Blur Kaca (Sekarang akan selalu full sampai bawah) */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-md" />

        <div className="relative z-10 w-full max-w-md">
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