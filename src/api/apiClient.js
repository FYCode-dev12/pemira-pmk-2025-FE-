import { API_BASE_URL, API_URL } from "../config/api";

// Get token from localStorage
const getAuthToken = () => {
  return (
    localStorage.getItem("auth_token") ||
    localStorage.getItem("admin_token") ||
    localStorage.getItem("voter_token")
  );
};

// Get CSRF token from cookie
const getCsrfToken = () => {
  const name = "XSRF-TOKEN";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(";").shift());
  }
  return null;
};

// Get CSRF cookie from Sanctum
export async function getCsrfCookie() {
  try {
    await fetch(`${API_URL}/sanctum/csrf-cookie`, {
      method: "GET",
      credentials: "include",
    });
  } catch (error) {
    console.error("Failed to get CSRF cookie:", error);
  }
}

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const token = getAuthToken();
  const csrfToken = getCsrfToken();

  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Add Authorization header if token exists
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Add CSRF token header for state-changing requests
  if (
    csrfToken &&
    ["POST", "PUT", "DELETE", "PATCH"].includes(options.method?.toUpperCase())
  ) {
    defaultHeaders["X-XSRF-TOKEN"] = csrfToken;
  }

  // Prepare body
  let body = undefined;
  if (options.body) {
    body =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
  }

  const init = {
    method: options.method || "GET",
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    body: body,
    credentials: "include", // Important for cookies (Sanctum)
  };

  try {
    const res = await fetch(url, init);

    // Handle 401 Unauthorized - auto logout
    if (res.status === 401) {
      localStorage.clear();
      window.location.href = "/";
      throw new Error("Unauthorized - Session expired");
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
