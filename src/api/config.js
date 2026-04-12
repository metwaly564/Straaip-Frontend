/**
 * Global API Configuration
 * Central source of truth for base URLs and security tokens.
 */

// Fallback to production domain if environment variable is missing
export const API_BASE = import.meta.env.VITE_API_URL || "https://admin.straipp.com";

// Security secret for admin operations
export const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || "";

// Standard API prefix used across most backend routes
export const API_PREFIX = "/api";

/**
 * Normalizes a path to ensure it starts with the correct API prefix
 */
export const normalizePath = (path, prefix = API_PREFIX) => {
  if (path.startsWith(prefix) || path.startsWith("http")) return path;
  return `${prefix}${path}`;
};
