import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { DEMO_MODE } from "@/config/api";
import { DEMO_ADMIN, DEMO_VOTER, resetDemo } from "@/api/mockApi";

// Penanda mode demo. Default tertutup (pil kecil) agar tidak menutupi tombol halaman.
const DemoBanner = () => {
  const [expanded, setExpanded] = useState(false);
  if (!DEMO_MODE) return null;

  return (
    <div className="fixed bottom-3 left-3 z-[100] max-w-[calc(100vw-1.5rem)] sm:max-w-md">
      {expanded ? (
        <div
          id="demo-info"
          role="note"
          className="mb-2 space-y-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg"
        >
          <p className="font-semibold">
            Tidak terhubung ke database. Semua data pemilih dan hasil suara fiktif.
          </p>
          <p>
            Pemilih di <code>/voter</code>: NIM <code>{DEMO_VOTER.nim}</code>, token{" "}
            <code>{DEMO_VOTER.token}</code>
          </p>
          <p>
            Admin di <code>/admin</code>: <code>{DEMO_ADMIN.username}</code> /{" "}
            <code>{DEMO_ADMIN.password}</code>
          </p>
          <button
            type="button"
            onClick={() => {
              resetDemo();
              window.location.assign("/");
            }}
            className="font-semibold underline underline-offset-2"
          >
            Reset data demo
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls="demo-info"
        className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-950 shadow-md hover:bg-amber-100"
      >
        <Info className="h-4 w-4" />
        Mode demo · akun demo
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
};

export default DemoBanner;
