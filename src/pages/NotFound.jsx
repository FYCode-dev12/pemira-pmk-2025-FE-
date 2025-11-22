import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100">
      {/* Animated blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-300/40 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-rose-300/40 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400/30 h-96 w-96 animate-spin" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-2xl rounded-2xl border bg-white/70 backdrop-blur-md shadow-xl p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <img
              src="https://res.cloudinary.com/dm3zixaz4/image/upload/v1763313569/Logo_Utama_dxucb5.png"
              alt="PEMIRA PMK ITERA"
              className="h-56 w-auto opacity-90"
            />
            <div className="relative">
              <span className="absolute -inset-1 blur-2xl bg-gradient-to-r from-amber-400 to-rose-400 opacity-50 rounded-full" />
              <h1 className="relative text-7xl md:text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-rose-500 tracking-tight">
                404
              </h1>
            </div>
            <p className="text-2xl font-semibold text-neutral-800">
              Halaman tidak ditemukan
            </p>
            <p className="text-neutral-600">
              URL yang Anda akses tidak tersedia:{" "}
              <code className="rounded-md bg-neutral-100 px-2 py-1 text-sm">
                {location.pathname}
              </code>
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/" className="inline-flex">
                <Button className="gap-2">
                  <Home className="w-4 h-4" />
                  Kembali ke Beranda
                </Button>
              </Link>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Button>
            </div>

            <div className="mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
