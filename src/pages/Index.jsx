import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Vote, ShieldCheck, Users, Globe } from "lucide-react";
import { useState, useEffect } from "react";

// Import kandidat dari file JSON lokal
import candidatesData from "../data/candidates.json";

const Index = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [candLoading, setCandLoading] = useState(true);
  const [candError, setCandError] = useState(null);

  const monthMap = {
    januari: 0,
    februari: 1,
    maret: 2,
    april: 3,
    mei: 4,
    juni: 5,
    juli: 6,
    agustus: 7,
    september: 8,
    oktober: 9,
    november: 10,
    desember: 11,
  };

  const parseTimeline = (tl) => {
    if (!tl || typeof tl !== "string") return null;
    tl = tl.trim();
    let m;
    if ((m = tl.match(/^(\d{1,2})-(\d{1,2}) (\w+) (\d{4})$/i))) {
      const [, d1, d2, mon, year] = m;
      const month = monthMap[mon.toLowerCase()];
      if (month == null) return null;
      const start = new Date(+year, month, +d1);
      const end = new Date(+year, month, +d2);
      return { start, end };
    }
    if ((m = tl.match(/^(\d{1,2}) (\w+) (\d{4})$/i))) {
      const [, d, mon, year] = m;
      const month = monthMap[mon.toLowerCase()];
      if (month == null) return null;
      const start = new Date(+year, month, +d);
      const end = new Date(+year, month, +d);
      return { start, end };
    }
    return null;
  };

  const today = new Date();
  const todayKey = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  const getStatus = (timeline) => {
    const parsed = parseTimeline(timeline);
    if (!parsed) return "Tidak Diketahui";
    const s = new Date(
      parsed.start.getFullYear(),
      parsed.start.getMonth(),
      parsed.start.getDate()
    ).getTime();
    const e = new Date(
      parsed.end.getFullYear(),
      parsed.end.getMonth(),
      parsed.end.getDate()
    ).getTime();
    if (todayKey < s) return "Akan Datang";
    if (todayKey > e) return "Selesai";
    return "Berlangsung";
  };

  const getStatusColor = (status) => {
    if (status === "Selesai") return "#16a34a";
    if (status === "Berlangsung") return "#dc2626";
    if (status === "Akan Datang") return "#924603";
    return "#6b7280";
  };

  useEffect(() => {
    // Ambil kandidat dari file JSON lokal (synchronous import)
    try {
      if (!Array.isArray(candidatesData)) {
        throw new Error(
          "Format candidates.json tidak valid (harus berupa array)."
        );
      }
      setCandidates(candidatesData);
    } catch (err) {
      console.error("Gagal memuat data kandidat dari file JSON:", err);
      setCandError("Gagal memuat kandidat (file lokal rusak).");
    } finally {
      setCandLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="HeroSection" id="beranda">
        {/* Hero */}
        <section className="flex justify-between items-center hero-padding">
          <div className="max-w-7xl mx-auto px-8 relative">
            <div className="grid grid-cols-12 gap-10 items-center">
              {/* Konten Teks */}
              <div className="col-span-7 space-y-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#924603] bg-[#F1C762] px-4 py-2 text-sm font-semibold tracking-wide text-[#2A1E09]">
                  <ShieldCheck className="w-4 h-4 text-[#924603]" />
                  Transparan • Aman • Demokratis
                </span>

                <div className="space-y-4">
                  <h1 className="text-5xl font-bold leading-tight tracking-tight">
                    <span className="text-[#2A1E09]">
                      Pemilihan Raya PMK 2025
                    </span>
                    <span className="block text-[#924603] mt-3">
                      Perkuat Suara, Bentuk Masa Depan
                    </span>
                  </h1>

                  <p className="text-lg text-[#2A1E09]/90 max-w-2xl leading-relaxed">
                    Platform e-voting modern untuk memastikan setiap suara
                    tercatat akurat, adil, dan real-time. Ayo ambil peranmu.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    className="font-semibold transition-all gap-3 px-6 py-4 rounded-lg bg-[#924603] shadow-lg hover:bg-[#924603]/90 text-white text-base ease-linear"
                    onClick={() => navigate("/voter")}
                  >
                    <Vote className="w-5 h-5" />
                    Mulai Memilih
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-3 bg-transparent text-[#924603] border-2 border-[#924603] px-6 py-4 rounded-lg font-semibold hover:bg-[#924603] hover:text-white transition-all ease-linear text-base"
                    onClick={() =>
                      document
                        .getElementById("kandidat")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    <Users className="w-5 h-5" />
                    Lihat Kandidat
                  </Button>
                </div>
              </div>

              <div className="col-span-5 flex justify-center">
                <div className="relative">
                  {/* Lingkaran dengan Gradient Lembut */}
                  <div className="w-96 h-96 rounded-full bg-gradient-to-br from-[#F1C762] to-[#FAEBC8] border-8 border-white shadow-2xl flex items-center justify-center">
                    <img
                      src="https://res.cloudinary.com/dm3zixaz4/image/upload/v1763313569/Logo_Utama_dxucb5.png"
                      alt="Logo Pemira"
                      className="w-64 h-auto object-contain drop-shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="TimelineSection w-full mt-48" id="timeline">
        <section className="max-w-7xl mx-auto px-8 py-24">
          <h2 className="text-4xl font-bold text-center tracking-tight">
            Timeline PEMIRA PMK 2025
          </h2>
          <div className="relative left-[22%] mx-auto max-w-full overflow-x-auto">
            <svg
              viewBox="0 0 750 600"
              className="w-full h-auto mx-auto drop-shadow-sm min-w-[800px]"
            >
              <line
                x1="200"
                y1="50"
                x2="200"
                y2="550"
                stroke="#924603"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {[
                {
                  key: "recruitment",
                  label: "Open Recruitment Calon Ketua Umum",
                  desc: "Seleksi & verifikasi kandidat.",
                  timeline: "2-6 November 2025",
                  color: "#F1C762",
                },
                {
                  key: "campaign",
                  label: "Masa Kampanye",
                  desc: "Penyampaian visi & misi.",
                  timeline: "9-15 November 2025",
                  color: "#F9D889",
                },
                {
                  key: "hearing",
                  label: "Hearing dan Debat",
                  desc: "Forum kompetitif dan Forum formal satu arah",
                  timeline: "21 November 2025",
                  color: "#F7C25E",
                },
                {
                  key: "voting",
                  label: "Voting",
                  desc: "Pemilih menyalurkan suaranya untuk para kandidat",
                  timeline: "25 November 2025",
                  color: "#F1B544",
                },
              ].map((n, i, arr) => {
                const x = 200;
                const y = 80 + i * ((520 - 80) / (arr.length - 1));
                const status = getStatus(n.timeline);
                const statusColor = getStatusColor(status);
                return (
                  <g key={n.key}>
                    <circle
                      cx={x}
                      cy={y}
                      r="40"
                      fill={n.color}
                      stroke="#924603"
                      strokeWidth="4"
                    />
                    <text
                      x={x + 60}
                      y={y - 15}
                      textAnchor="start"
                      fontSize="18"
                      fontWeight="600"
                      fill="#2A1E09"
                    >
                      {n.label}
                    </text>
                    <text
                      x={x + 60}
                      y={y + 8}
                      textAnchor="start"
                      fontSize="15"
                      fill="#2A1E09"
                      opacity="0.85"
                    >
                      {n.desc}
                    </text>
                    <text
                      x={x + 60}
                      y={y + 28}
                      textAnchor="start"
                      fontSize="15"
                      fill="#2A1E09"
                      opacity="0.8"
                    >
                      {n.timeline} •{" "}
                      <tspan fill={statusColor} fontWeight="600">
                        {status}
                      </tspan>
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>
      </div>

      <div className="KandidatSection w-full" id="kandidat">
        <section className="max-w-7xl mx-auto px-8 py-24">
          <h2 className="text-4xl font-bold mb-12 text-center tracking-tight">
            Kandidat PEMIRA PMK 2025
          </h2>

          {candError && (
            <div className="text-center text-red-600 mb-8 text-base">
              {candError}
            </div>
          )}

          {candLoading && (
            <div className="grid grid-cols-2 gap-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border bg-white shadow p-6 flex flex-col gap-4"
                >
                  <div className="h-40 w-full bg-muted rounded-lg" />
                  <div className="h-6 w-1/2 bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              ))}
            </div>
          )}

          {!candLoading && !candError && candidates.length > 0 && (
            <div className="grid grid-cols-2 gap-8">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  className="group rounded-xl border bg-white shadow hover:shadow-lg transition flex flex-col overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={c.foto_url || "/Aset-03.png"}
                      alt={c.nama}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/Aset-03.png";
                      }}
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#924603] text-white text-xs font-semibold shadow-lg">
                      No. {c.no_urut}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-[#2A1E09] mb-2">
                      {c.nama}
                    </h3>
                    <p className="text-base font-medium text-gray-500 mb-5 leading-relaxed">
                      {c.prodi || "Teknik Informatika"} | Angkatan{" "}
                      {c.angkatan || "1990"}
                    </p>

                    <div className="space-y-4 flex-1">
                      <div>
                        <p className="font-semibold text-[#924603] mb-2 text-lg">
                          Visi
                        </p>
                        <blockquote className="border-l-4 border-[#F1C762] pl-4 italic text-muted-foreground text-base leading-relaxed">
                          {c.visi?.length ? c.visi[0] : "Visi tidak tersedia"}
                        </blockquote>
                      </div>

                      <details className="text-base">
                        <summary className="font-semibold text-[#924603] cursor-pointer hover:underline text-lg">
                          Lihat Misi
                        </summary>
                        <ul className="list-disc list-inside space-y-1 mt-2 pl-4 text-muted-foreground leading-relaxed">
                          {c.misi?.length ? (
                            c.misi.map((m, i) => <li key={i}>{m}</li>)
                          ) : (
                            <li className="italic">Misi tidak tersedia</li>
                          )}
                        </ul>
                      </details>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!candLoading && !candError && candidates.length === 0 && (
            <div className="text-center py-20 text-muted-foreground text-base">
              Belum ada data kandidat.
            </div>
          )}
        </section>
      </div>

      <div className="AboutSection w-full" id="tentang">
        <section className="max-w-7xl mx-auto px-8 py-24">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold tracking-tight mb-6 text-[#2A1E09]">
              Tentang Platform PEMIRA PMK 2025
            </h2>
            <p className="text-[#2A1E09]/80 max-w-3xl mx-auto text-lg leading-relaxed">
              Platform e-voting yang memadukan kecepatan, keakuratan, dan
              kemudahan akses. Dirancang agar proses pemilihan berjalan adil,
              aman, dan meningkatkan partisipasi anggota PMK ITERA.
            </p>
          </div>

          <Card className="mb-16 border-[#F1C762]/60 shadow-sm hover:shadow-md transition">
            <CardHeader>
              <CardTitle className="text-[#924603] text-2xl">
                Fitur Utama
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Ringkasan kemampuan inti sistem.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-8 pt-4">
              <div>
                <h3 className="font-semibold text-[#924603] mb-2 text-xl">
                  Transparansi Real-Time
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Dashboard menampilkan perolehan suara & partisipasi yang
                  diperbarui otomatis setiap beberapa detik tanpa refresh
                  manual.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#924603] mb-2 text-xl">
                  Keamanan & Validasi
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Setiap pemilih diverifikasi dengan NIM + token. Satu akun
                  hanya dapat melakukan satu kali voting. Admin login
                  menggunakan hash password.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#924603] mb-2 text-xl">
                  Manajemen Data
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Admin dapat memantau daftar pemilih, melakukan pencarian
                  cepat, serta melihat status sudah / belum memilih dan waktu
                  voting.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mb-20 rounded-xl bg-white border shadow-sm p-8">
            <h3 className="text-2xl font-bold mb-6 text-[#2A1E09]">
              Nilai Inti
            </h3>
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex-1">
                <h4 className="font-semibold text-[#924603] mb-2 text-xl">
                  Transparansi
                </h4>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Setiap perubahan segera tercermin. Meningkatkan kepercayaan
                  pemilih terhadap proses.
                </p>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#924603] mb-2 text-xl">
                  Keamanan
                </h4>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Mencegah manipulasi suara dengan validasi dan pembatasan satu
                  suara per akun.
                </p>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#924603] mb-2 text-xl">
                  Partisipasi
                </h4>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Antarmuka sederhana, responsif, dan informatif mendorong lebih
                  banyak anggota ikut memilih.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-24 grid md:grid-cols-2 gap-10">
            <div className="p-6 rounded-lg border bg-white shadow-sm">
              <h4 className="font-semibold text-[#924603] mb-3 text-xl">
                Stack Teknis
              </h4>
              <ul className="space-y-2 text-base text-muted-foreground leading-relaxed">
                <li>Frontend: React + Utility Classes (Tailwind konsep)</li>
                <li>Grafik: Recharts untuk visual suara & partisipasi</li>
                <li>Backend: ReactPHP async non-blocking</li>
                <li>Database: MySQL (tabel pemilih, suara, kandidat)</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border bg-white shadow-sm">
              <h4 className="font-semibold text-[#924603] mb-3 text-xl">
                Alur Sistem
              </h4>
              <ul className="space-y-2 text-base text-muted-foreground leading-relaxed">
                <li>Login pemilih (NIM + token) → validasi</li>
                <li>Pemilihan kandidat → simpan suara → tandai status</li>
                <li>Admin login → akses statistik real-time</li>
                <li>Dashboard menampilkan agregasi & partisipasi fakultas</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4 text-[#2A1E09] tracking-tight">
              Siap Berpartisipasi?
            </h3>
            <p className="text-lg text-[#2A1E09]/70 mb-8 max-w-xl mx-auto leading-relaxed">
              Suara Anda menentukan arah kepemimpinan. Masuk dan jadi bagian
              dari proses demokrasi PMK ITERA.
            </p>
            <Button
              size="lg"
              className="bg-[#924603] hover:bg-[#7a3a02] text-white px-10 py-6 rounded-lg font-semibold transition text-base"
              onClick={() => navigate("/voter")}
            >
              Masuk Untuk Memilih
            </Button>
          </div>
        </section>
      </div>

      <footer className="bg-[#2A1E09] text-white">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-3 gap-12 mb-12">
            <div className="col-span-1">
              <h4 className="font-bold text-[#F1C762] mb-4 text-lg">
                Navigasi
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#beranda"
                    className="text-gray-300 hover:text-[#F1C762] transition-colors text-base"
                  >
                    Beranda
                  </a>
                </li>
                <li>
                  <a
                    href="#kandidat"
                    className="text-gray-300 hover:text-[#F1C762] transition-colors text-base"
                  >
                    Kandidat
                  </a>
                </li>
                <li>
                  <a
                    href="#timeline"
                    className="text-gray-300 hover:text-[#F1C762] transition-colors text-base"
                  >
                    Timeline
                  </a>
                </li>
                <li>
                  <a
                    href="#tentang"
                    className="text-gray-300 hover:text-[#F1C762] transition-colors text-base"
                  >
                    Tentang
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="https://res.cloudinary.com/dm3zixaz4/image/upload/v1763313569/Logo_Utama_dxucb5.png"
                  alt="Logo"
                  className="h-12 w-auto object-contain"
                />
                <div className="flex flex-col leading-none">
                  <div className="text-xl text-white font-bold">PEMIRA</div>
                  <span className="text-sm text-[#F1C762]">PMK ITERA 2025</span>
                </div>
              </div>
              <p className="text-base text-gray-400 leading-relaxed">
                Platform e-voting resmi untuk Pemilihan Raya PMK ITERA 2025.
                Transparan, aman, dan demokratis.
              </p>
            </div>

            <div className="col-span-1">
              <h4 className="font-bold text-[#F1C762] mb-4 text-lg">
                Media Sosial
              </h4>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com/pmk_itera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#924603] hover:bg-[#F1C762] flex items-center justify-center transition-colors"
                >
                  {/* instagram icon */}
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.pmkitera.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#924603] hover:bg-[#F1C762] flex items-center justify-center transition-colors"
                >
                  <Globe className="w-5 h-5" />
                </a>
                <a
                  href="https://tiktok.com/@pmk_itera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#924603] hover:bg-[#F1C762] flex items-center justify-center transition-colors"
                >
                  {/* tiktok icon */}
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              </div>
              <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                Ikuti media sosial kami untuk update terbaru seputar PEMIRA PMK
                ITERA 2025
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-row justify-center items-center gap-4">
              <p className="text-base text-gray-400">
                © 2025 PMK ITERA. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
