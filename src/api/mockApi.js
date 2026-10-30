// Backend tiruan untuk mode demo (VITE_DEMO_MODE=true).
// Bentuk respons mengikuti controller Laravel di repo backend, tetapi semua data
// di sini fiktif dan hanya tersimpan di sessionStorage browser pengunjung.
import candidatesData from "../data/candidates.json";

export const DEMO_ADMIN = { username: "admin", password: "demo123" };
export const DEMO_VOTER = { nim: "120140001", token: "DEMO01" };

const STORAGE_KEY = "pemira_demo_state";
const LATENCY_MS = 350;

const FACULTIES = {
  FS: ["S1 MATEMATIKA", "S1 FISIKA", "S1 KIMIA", "S1 BIOLOGI", "S1 SAINS DATA"],
  FTI: ["S1 TEKNIK INFORMATIKA", "S1 TEKNIK ELEKTRO", "S1 TEKNIK MESIN", "S1 TEKNIK KIMIA", "S1 TEKNIK GEOFISIKA"],
  FTIK: ["S1 TEKNIK SIPIL", "S1 ARSITEKTUR", "S1 PERENCANAAN WILAYAH DAN KOTA", "S1 DESAIN KOMUNIKASI VISUAL"],
};
const FIRST_NAMES = ["Andreas", "Bella", "Christian", "Debora", "Elisa", "Felix", "Grace", "Hana", "Imanuel", "Joshua", "Kezia", "Lukas", "Maria", "Natanael", "Olivia", "Petrus", "Rut", "Samuel", "Tabita", "Yohana"];
const LAST_NAMES = ["Contoh", "Demo", "Simulasi", "Fiktif", "Uji Coba", "Sampel"];
const TOTAL_VOTERS = 240;

// PRNG sederhana agar data dummy sama di setiap kunjungan.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildInitialState() {
  const rand = seeded(2025);
  const facultyKeys = Object.keys(FACULTIES);
  const voters = [];
  const votes = [];
  for (let i = 1; i <= TOTAL_VOTERS; i++) {
    const fakultas = facultyKeys[Math.floor(rand() * facultyKeys.length)];
    const prodiList = FACULTIES[fakultas];
    const isDemoVoter = i === 1;
    const voted = !isDemoVoter && rand() < 0.62;
    const voter = {
      id: i,
      nim: isDemoVoter ? DEMO_VOTER.nim : `1201${String(40000 + i).padStart(5, "0")}`,
      nama: `${FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]}`,
      fakultas,
      program_studi: prodiList[Math.floor(rand() * prodiList.length)],
      token: isDemoVoter ? DEMO_VOTER.token : rand().toString(36).slice(2, 8).toUpperCase(),
      sudah_memilih: voted ? 1 : 0,
      waktu_memilih: voted
        ? new Date(Date.UTC(2025, 10, 26, 1 + Math.floor(rand() * 8), Math.floor(rand() * 60))).toISOString()
        : null,
    };
    voters.push(voter);
    if (voted) votes.push({ pemilih_id: i, kandidat_id: rand() < 0.5 ? 1 : 2 });
  }
  return { voters, votes, isOpen: true };
}

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // sessionStorage tidak tersedia: pakai state baru
  }
  const state = buildInitialState();
  saveState(state);
  return state;
}

function saveState(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // abaikan: demo tetap berjalan tanpa persistensi
  }
}

export function resetDemo() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // abaikan
  }
  localStorage.clear();
}

function fail(message) {
  throw new Error(message);
}

function currentVoterId() {
  const token = localStorage.getItem("voter_token") || "";
  const match = token.match(/^demo-voter-(\d+)$/);
  return match ? Number(match[1]) : null;
}

function isAdmin() {
  return (localStorage.getItem("admin_token") || "").startsWith("demo-admin");
}

const routes = {
  "POST /auth/admin/login": ({ body }) => adminLogin(body, "admin"),
  "POST /auth/super-admin/login": ({ body }) => adminLogin(body, "super-admin"),

  "POST /auth/pemilih/login": ({ body, state }) => {
    const voter = state.voters.find(
      (v) => v.nim === String(body.nim).trim() && v.token.toUpperCase() === String(body.token).trim().toUpperCase()
    );
    if (!voter) fail("Token atau NIM tidak valid");
    if (voter.sudah_memilih) fail("Anda telah melakukan voting sebelumnya. Tidak dapat login kembali.");
    return {
      status: "success",
      role: "pemilih",
      token: `demo-voter-${voter.id}`,
      pemilih: { id: voter.id, nim: voter.nim, nama: voter.nama, sudah_memilih: false },
    };
  },

  "POST /auth/logout": () => ({ status: "success", message: "Logout berhasil" }),

  "GET /kandidat": () => ({
    status: "success",
    data: candidatesData.map((k) => ({ id: k.id, nomor_urut: k.no_urut, nama: k.nama })),
  }),

  "GET /vote/status": ({ state }) => {
    const voter = state.voters.find((v) => v.id === currentVoterId());
    if (!voter) fail("Unauthorized");
    return { status: "success", sudah_memilih: Boolean(voter.sudah_memilih) };
  },

  "POST /vote": ({ body, state }) => {
    if (!state.isOpen) fail("Voting sedang ditutup. Silakan tunggu hingga voting dibuka kembali.");
    const voter = state.voters.find((v) => v.id === currentVoterId());
    if (!voter) fail("Unauthorized");
    if (voter.sudah_memilih) fail("Anda sudah melakukan voting");
    const kandidatId = Number(body.kandidat_id);
    if (!candidatesData.some((k) => k.id === kandidatId)) fail("Kandidat tidak ditemukan");
    voter.sudah_memilih = 1;
    voter.waktu_memilih = new Date().toISOString();
    state.votes.push({ pemilih_id: voter.id, kandidat_id: kandidatId });
    return { status: "success", success: true, message: "Vote berhasil disimpan" };
  },

  "GET /results/summary": ({ state }) => {
    requireAdmin();
    return {
      status: "success",
      // Nama kandidat sengaja disamarkan: angka di demo bukan hasil Pemira yang sebenarnya.
      data: candidatesData.map((k) => ({
        kandidat_id: k.id,
        nomor_urut: k.no_urut,
        nama: `Kandidat ${k.no_urut} (data demo)`,
        total_suara: state.votes.filter((v) => v.kandidat_id === k.id).length,
      })),
      total_pemilih_sudah_memilih: state.voters.filter((v) => v.sudah_memilih).length,
      total_pemilih: state.voters.length,
    };
  },

  "GET /results/voters": ({ query, state }) => {
    requireAdmin();
    const search = (query.get("search") || "").toLowerCase();
    const filter = query.get("filter") || "all";
    const page = Math.max(1, Number(query.get("page")) || 1);
    const perPage = Math.max(1, Number(query.get("per_page")) || 50);
    const rows = state.voters.filter((v) => {
      if (filter === "voted" && !v.sudah_memilih) return false;
      if (filter === "not-voted" && v.sudah_memilih) return false;
      if (!search) return true;
      return [v.nim, v.nama, v.fakultas, v.program_studi].some((f) => f.toLowerCase().includes(search));
    });
    const total = rows.length;
    return {
      status: "success",
      data: rows.slice((page - 1) * perPage, page * perPage),
      pagination: {
        current_page: page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
        from: total === 0 ? 0 : (page - 1) * perPage + 1,
        to: Math.min(page * perPage, total),
      },
    };
  },

  "GET /admin/voting-status": ({ state }) => {
    requireAdmin();
    return { status: "success", data: { is_open: state.isOpen } };
  },

  "POST /admin/voting-status": ({ body, state }) => {
    requireAdmin();
    state.isOpen = Boolean(body.is_open);
    return {
      status: "success",
      message: state.isOpen ? "Voting berhasil dibuka" : "Voting berhasil ditutup",
      data: { is_open: state.isOpen },
    };
  },

  "GET /health": () => ({ status: "ok", mode: "demo" }),
};

function adminLogin(body, role) {
  if (body.username !== DEMO_ADMIN.username || body.password !== DEMO_ADMIN.password) {
    fail(role === "admin" ? "Kredensial admin tidak valid" : "Kredensial super admin tidak valid");
  }
  return {
    status: "success",
    role,
    token: `demo-admin-${role}`,
    admin: { id: 1, username: DEMO_ADMIN.username, role },
  };
}

function requireAdmin() {
  if (!isAdmin()) fail("Unauthorized");
}

export async function mockFetch(path, options = {}) {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  const url = new URL(path, "http://demo.local");
  const method = (options.method || "GET").toUpperCase();
  const handler = routes[`${method} ${url.pathname}`];
  if (!handler) fail(`Endpoint demo tidak tersedia: ${method} ${url.pathname}`);

  const body = typeof options.body === "string" ? JSON.parse(options.body) : options.body || {};
  const state = loadState();
  const result = handler({ body, query: url.searchParams, state });
  saveState(state);
  return result;
}
