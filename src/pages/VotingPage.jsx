import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { kandidatService, voteService } from "../api/services";
import candidatesData from "../data/candidates.json";

const VotingPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [candLoading, setCandLoading] = useState(true);
  const [candError, setCandError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voting, setVoting] = useState(false);
  const [voteComplete, setVoteComplete] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [logoutSeconds, setLogoutSeconds] = useState(10);

  // store voter info in state so JSX can use it
  const [voterName, setVoterName] = useState("");
  const [voterId, setVoterId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Ambil info voter dari localStorage lalu redirect bila tidak ada voter_id
    const id = localStorage.getItem("voter_id");
    const name = localStorage.getItem("voter_name");

    if (!id) {
      navigate("/voter", { replace: true });
      return;
    }

    setVoterId(id);
    setVoterName(name || "Pemilih");
  }, [navigate]);

  useEffect(() => {
    // Fetch candidates from Laravel backend
    const fetchCandidates = async () => {
      try {
        const response = await kandidatService.getAll();

        // Backend returns { status: 'success', data: [...] }
        if (response.status === "success" && Array.isArray(response.data)) {
          setCandidates(candidatesData);
        } else if (response.success && Array.isArray(response.data)) {
          setCandidates(candidatesData);
        } else if (Array.isArray(response)) {
          setCandidates(candidatesData);
        } else {
          throw new Error("Format response tidak valid");
        }
      } catch (err) {
        console.error("Gagal memuat data kandidat:", err);
        setCandError(err.message || "Gagal memuat kandidat dari server.");
      } finally {
        setCandLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // Auto-logout helper
  const performLogout = () => {
    localStorage.removeItem("voter_id");
    localStorage.removeItem("voter_nim");
    localStorage.removeItem("voter_name");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("voter_token");
    navigate("/voter");
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) {
      toast.error("Pilih kandidat terlebih dahulu.");
      return;
    }

    setVoting(true);

    try {
      const response = await voteService.vote(selectedCandidate);

      if (response.success || response.message?.includes("berhasil")) {
        setConfirmOpen(false);
        setVoteComplete(true);
        setLogoutSeconds(60);
        toast.success("Terima kasih! Suara Anda telah tercatat.", {
          duration: 3000,
        });
      } else {
        toast.error(
          response.message || "Gagal menyimpan suara. Silakan coba lagi."
        );
      }
    } catch (error) {
      console.error("Error saat vote:", error);
      toast.error(error.message || "Koneksi ke server gagal.");
    } finally {
      setVoting(false);
    }
  };
  useEffect(() => {
    // lock scroll when modal open
    if (confirmOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [confirmOpen]);

  // Start countdown when voteComplete is true
  useEffect(() => {
    if (!voteComplete) return;
    const id = setInterval(() => {
      setLogoutSeconds((s) => s - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [voteComplete]);

  // Perform logout once countdown finishes
  useEffect(() => {
    if (voteComplete && logoutSeconds <= 0) {
      performLogout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voteComplete, logoutSeconds]);

  const selectedDetail = candidates.find((x) => x.id === selectedCandidate);

  if (voteComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f1c662d3] to-[#511600a1] p-4">
        <Card className="w-full max-w-md text-center border-success/50">
          <CardContent className="pt-12 pb-12">
            <CheckCircle2 className="w-20 h-20 mx-auto text-secondary mb-6" />
            <h2 className="text-3xl font-bold text-secondary mb-4">
              Suara Anda Tercatat!
            </h2>
            <p className="text-lg text-muted-foreground" aria-live="polite">
              Terima kasih atas partisipasi Anda dalam Pemilihan Raya PMK ITERA
              2025. Anda akan otomatis logout dalam {logoutSeconds} detik.
            </p>
            <Button
              className="mt-6"
              variant="secondary"
              onClick={performLogout}
            >
              Logout sekarang
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1c662d3] to-[#511600a1] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-3">
            Syalom, {voterName}
          </h1>
          <p className="text-lg text-[#511600a1]">
            Pilih salah satu pasangan kandidat
          </p>
        </div>

        {candError && (
          <div className="text-center text-red-600 mb-8 text-sm">
            {candError}
          </div>
        )}

        {/* Cards Kandidat */}
        {!candLoading && !candError && candidates.length > 0 && (
          <div className="grid grid-cols-2 gap-8">
            {candidates.map((c) => (
              <div
                key={c.id}
                className="group rounded-xl border bg-white shadow hover:shadow-lg transition flex flex-col overflow-hidden"
              >
                <div className="relative flex justify-center">
                  <img
                    src={c.foto_url}
                    alt={c.nama}
                    className="h-auto w-72 rounded-3xl p-3"
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
                  <h3 className="text-xl font-bold text-[#2A1E09] mb-1">
                    {c.nama}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 mb-5">
                    {c.prodi || "Teknik Informatika"} | Angkatan{" "}
                    {c.angkatan || "1990"}
                  </p>

                  <div className="space-y-4 flex-1">
                    <div>
                      <p className="font-semibold text-[#924603] mb-2 text-base">
                        Visi
                      </p>
                      <blockquote className="border-l-4 border-[#F1C762] pl-4 italic text-muted-foreground">
                        {Array.isArray(c.visi)
                          ? c.visi[0]
                          : c.visi || "Visi tidak tersedia"}
                      </blockquote>
                    </div>

                    <details className="text-base">
                      <summary className="font-semibold text-[#924603] cursor-pointer hover:underline">
                        Lihat Misi
                      </summary>
                      <ul className="list-disc list-inside space-y-1 mt-2 pl-4 text-muted-foreground">
                        {Array.isArray(c.misi) ? (
                          c.misi.map((m, i) => <li key={i}>{m}</li>)
                        ) : c.misi ? (
                          <li>{c.misi}</li>
                        ) : (
                          <li className="italic">Misi tidak tersedia</li>
                        )}
                      </ul>
                    </details>
                  </div>

                  {/* Trigger Dialog */}
                  <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                    <Button
                      size="lg"
                      className="w-full text-lg font-semibold h-14"
                      onClick={() => {
                        setSelectedCandidate(c.id);
                        setConfirmOpen(true);
                      }}
                    >
                      Pilih Kandidat {c.no_urut}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!candLoading && !candError && candidates.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            Belum ada data kandidat.
          </div>
        )}

        {/* Custom modal konfirmasi */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => !voting && setConfirmOpen(false)}
            />
            <div className="relative bg-white dark:bg-neutral-900 w-full max-w-sm rounded-lg shadow-lg border p-6 animate-in fade-in zoom-in">
              <h2 className="text-2xl font-semibold mb-4">
                Konfirmasi Pilihan
              </h2>
              <div className="text-base text-primary space-y-3">
                <p>
                  Anda memilih{" "}
                  <strong>Kandidat {selectedCandidate || "-"}</strong>.
                </p>
                {selectedDetail && (
                  <div className="rounded-md text-center flex flex-col items-center justify-center">
                    <img
                      src={selectedDetail.foto_url}
                      className="w-[70%] h-auto rounded-md"
                      alt={selectedDetail.nama}
                    />
                    <p className="font-semibold pt-3">{selectedDetail.nama}</p>
                  </div>
                )}
                <p>
                  Pilihan tidak dapat diubah setelah dikonfirmasi. Lanjutkan?
                </p>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  disabled={voting}
                  onClick={() => setConfirmOpen(false)}
                  className="hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleConfirmVote}
                  disabled={voting || !selectedCandidate || !voterId}
                >
                  {voting ? "Memproses..." : "Ya, Konfirmasi"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingPage;
