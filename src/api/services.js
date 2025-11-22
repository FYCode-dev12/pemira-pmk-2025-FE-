import { apiFetch, getCsrfCookie } from "./apiClient";

/**
 * Authentication Services
 */
export const authService = {
  // Admin Login
  loginAdmin: async (username, password) => {
    const response = await apiFetch("/auth/admin/login", {
      method: "POST",
      body: { username, password },
    });

    if (response.token) {
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("admin_token", response.token);
      localStorage.setItem("user_role", response.role || "admin");
      localStorage.setItem("user_data", JSON.stringify(response.user || {}));
    }

    return response;
  },

  // Super Admin Login
  loginSuperAdmin: async (username, password) => {
    const response = await apiFetch("/auth/super-admin/login", {
      method: "POST",
      body: { username, password },
    });

    if (response.token) {
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("admin_token", response.token);
      localStorage.setItem("user_role", response.role || "super-admin");
      localStorage.setItem("user_data", JSON.stringify(response.user || {}));
    }

    return response;
  },

  // Pemilih Login
  loginPemilih: async (nim, token) => {
    const response = await apiFetch("/auth/pemilih/login", {
      method: "POST",
      body: { nim, token },
    });

    if (response.token) {
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("voter_token", response.token);
      localStorage.setItem(
        "voter_id",
        response.pemilih?.id || response.voter_id
      );
      localStorage.setItem("voter_nim", nim);
      localStorage.setItem(
        "voter_name",
        response.pemilih?.nama || response.voter_name || "Pemilih"
      );
      localStorage.setItem("user_role", "pemilih");
    }

    return response;
  },

  // Logout
  logout: async () => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all localStorage
      localStorage.clear();
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("auth_token");
  },

  // Get user role
  getUserRole: () => {
    return localStorage.getItem("user_role");
  },
};

/**
 * Kandidat Services
 */
export const kandidatService = {
  // Get all kandidat
  getAll: async () => {
    return await apiFetch("/kandidat", {
      method: "GET",
    });
  },
};

/**
 * Vote Services
 */
export const voteService = {
  // Submit vote
  vote: async (kandidatId) => {
    return await apiFetch("/vote", {
      method: "POST",
      body: { kandidat_id: kandidatId },
    });
  },

  // Check vote status
  getStatus: async () => {
    return await apiFetch("/vote/status", {
      method: "GET",
    });
  },
};

/**
 * Results Services (Admin only)
 */
export const resultsService = {
  // Get voting results summary
  getSummary: async () => {
    return await apiFetch("/results/summary", {
      method: "GET",
    });
  },
};

/**
 * Admin Services
 */
export const adminService = {
  // Get all pemilih data with filters and pagination
  getVoters: async (search = "", filter = "all", page = 1, perPage = 50) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (filter) params.append("filter", filter);
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());

    return await apiFetch(`/results/voters?${params.toString()}`, {
      method: "GET",
    });
  },
};

export default {
  auth: authService,
  kandidat: kandidatService,
  vote: voteService,
  results: resultsService,
  admin: adminService,
};
