// API Configuration
// Set VITE_API_BASE_URL in your .env file
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
