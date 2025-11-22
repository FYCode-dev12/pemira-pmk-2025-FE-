import { useEffect, useState } from "react";
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

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const admin_token = localStorage.getItem("admin_token");

    if (admin_token && location.pathname !== "/admin/dashboard") {
      navigate("/admin/dashboard", { replace: true });
    } else if (!admin_token && location.pathname !== "/admin") {
      navigate("/admin", { replace: true });
    }
  }, [navigate, location.pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.loginAdmin(username.trim(), password);

      // Backend returns { status: 'success', token: '...', admin: {...} }
      if (response.status === "success" || response.token) {
        toast.success("Login admin berhasil!");
        navigate("/admin/dashboard");
      } else {
        toast.error(response.message || "Username atau password salah.");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error(
        error.message ||
          "Koneksi ke server gagal. Pastikan backend Laravel berjalan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 bg-gradient-to-br from-[#f1c662d3] to-[#511600a1] overflow-hidden">
      <div className="w-full max-w-5xl">
        <Card className="border-none flex flex-row bg-primary-foreground rounded-2xl shadow-2xl overflow-hidden">
          <CardContent className="w-1/2 p-12 bg-gradient-to-bl from-[#f1c662d3] to-[#947100a1] items-center justify-center flex flex-col">
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
          <CardContent className="w-1/2 p-12">
            <div>
              <CardTitle className="text-3xl font-bold text-primary mt-2">
                Selamat Datang
              </CardTitle>
              <CardDescription className="text-base text-primary mb-3">
                Masuk dengan kredensial admin
              </CardDescription>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="px-4 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="px-4 h-12"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>
            <div className="mt-6 text-center space-y-2">
              <div>
                <a
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  <MoveLeft className="inline-block w-4 me-2" />
                  Kembali ke Halaman Utama
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
