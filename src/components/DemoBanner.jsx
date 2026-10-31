import { useEffect, useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { DEMO_MODE } from "@/config/api";
import { DEMO_ADMIN, DEMO_VOTER, resetDemo } from "@/api/mockApi";

const INTRO_KEY = "pemira_demo_intro_seen";

function DemoAccounts() {
  return (
    <>
      <p>
        Pemilih di <code>/voter</code>: NIM <code>{DEMO_VOTER.nim}</code>, token{" "}
        <code>{DEMO_VOTER.token}</code>
      </p>
      <p>
        Admin di <code>/admin</code>: <code>{DEMO_ADMIN.username}</code> /{" "}
        <code>{DEMO_ADMIN.password}</code>
      </p>
    </>
  );
}

// Penanda mode demo: jendela pembuka sekali per sesi, lalu pil kecil yang selalu terlihat.
const DemoBanner = () => {
  const [expanded, setExpanded] = useState(false);
  const [intro, setIntro] = useState(false);

  useEffect(() => {
    if (!DEMO_MODE) return;
    if (!document.title.startsWith("[DEMO]")) document.title = `[DEMO] ${document.title}`;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read sessionStorage once after mount
      setIntro(!sessionStorage.getItem(INTRO_KEY));
    } catch {
      setIntro(true);
    }
  }, []);

  if (!DEMO_MODE) return null;

  const closeIntro = () => {
    setIntro(false);
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // abaikan
    }
  };

  return (
    <>
      {intro ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-intro-title"
            className="w-full max-w-md space-y-3 rounded-xl bg-white p-6 text-sm text-neutral-800 shadow-2xl"
          >
            <p className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold tracking-wide text-amber-900">
              VERSI DEMO
            </p>
            <h2 id="demo-intro-title" className="text-lg font-bold text-neutral-900">
              Ini versi demo website Pemira PMK ITERA 2025
            </h2>
            <p>
              Website ini tidak terhubung ke database. Semua data pemilih dan hasil suara adalah
              data dummy, bukan data atau hasil Pemira yang sebenarnya.
            </p>
            <div className="space-y-1 rounded-lg bg-neutral-100 p-3">
              <DemoAccounts />
            </div>
            <button
              type="button"
              onClick={closeIntro}
              autoFocus
              className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 font-semibold text-white hover:bg-neutral-800"
            >
              Mengerti, lihat demo
            </button>
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-3 left-3 z-[100] max-w-[calc(100vw-1.5rem)] sm:max-w-md">
        {expanded ? (
          <div
            id="demo-info"
            role="note"
            className="mb-2 space-y-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg"
          >
            <p className="font-semibold">
              Versi demo: tidak terhubung ke database. Semua data pemilih dan hasil suara adalah
              data dummy.
            </p>
            <DemoAccounts />
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
          DEMO · data dummy
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>
    </>
  );
};

export default DemoBanner;
