import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { MoveLeft } from "lucide-react";
import { authService } from "../api/services";

const VoterLogin = () => {
  const [nim, setNim] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem("voter_id");
    if (id) {
      navigate("/voting", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.loginPemilih(nim, token);

      // Backend returns { status: 'success', token: '...', pemilih: {...} }
      if (response.status === "success" || response.token) {
        toast.success("Login berhasil!");
        navigate("/voting");
      } else {
        toast.error(
          response.message || "Login gagal. Periksa NIM dan Token Anda."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.message ||
          "Koneksi ke server gagal. Pastikan backend Laravel berjalan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#f1c662d3] to-[#511600a1] overflow-hidden">
      <div className="w-full max-w-5xl">
        <Card className="border-none flex flex-row bg-primary-foreground/95 rounded-2xl shadow-2xl overflow-hidden">
          <CardContent className="w-1/2 p-12">
            <form onSubmit={handleLogin} className="max-w-md mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#511600a1] mb-1">
                  Selamat Datang
                </h2>
                <p className="text-sm text-[#511600a1] mb-4">
                  Masukan NIM dan Token Anda
                </p>
                <div className="space-y-2">
                  <Label htmlFor="nim" className="font-medium">
                    Nomor Induk Mahasiswa (NIM)
                  </Label>
                  <Input
                    id="nim"
                    type="text"
                    placeholder="Contoh: 1234567890"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    required
                    className="h-12 rounded-md bg-background/70 px-3 focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-orange))]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token" className="font-medium">
                    Token Pemilihan
                  </Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="Token rahasia"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    className="h-12 px-3 rounded-md bg-background/70 tracking-widest focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-orange))] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 mt-4 text-base font-semibold bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--brand-orange))] text-primary-foreground hover:opacity-90 shadow-md shadow-[hsl(var(--brand-orange))]/30 transition"
                >
                  {loading ? "Memproses..." : "Masuk & Pilih"}
                </Button>
              </div>
            </form>

            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Pastikan data sesuai. Token bersifat satu kali pakai.
              </p>
            </div>
          </CardContent>
          <CardContent className="w-1/2 p-12 bg-[#f1c662d3] items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-wide bg-[#511600a1] bg-clip-text text-transparent">
                PEMIRA PMK 2025
              </h1>
              <p className="text-sm text-[#511600a1]">
                Akses pemilihan aman & transparan.
              </p>
              <div className="mt-8 flex justify-center">
                <div className="w-56 h-56 bg-white/90 rounded-full flex items-center justify-center shadow-xl overflow-hidden">
                  <img
                    src="https://res.cloudinary.com/dm3zixaz4/image/upload/v1763313569/Logo_Utama_dxucb5.png"
                    alt="Logo Pemira PMK"
                    width={180}
                    height={180}
                    className="object-cover text-transparent"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoterLogin;
