// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
export const API_BASE = API_BASE_URL; // Alias for compatibility

// Mode demo: frontend berjalan tanpa backend, memakai data dummy di src/api/mockApi.js
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
