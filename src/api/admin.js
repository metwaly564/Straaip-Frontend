import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE, ADMIN_SECRET, normalizePath } from "./config";

/**
 * Admin API Service Layer
 * Uses Axios for unified request/response handling.
 */

const adminApi = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor (Security Header) ───────────────────────────────────

adminApi.interceptors.request.use(
  (config) => {
    if (ADMIN_SECRET) {
      config.headers["admin-password"] = ADMIN_SECRET;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (Global Error Handling & Auth Guard) ───────────────

adminApi.interceptors.response.use(
  (response) => {
    // Return only the data payload for cleaner service calls
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || "An unexpected error occurred.";

    // Unified Error Notification
    toast.error(message, {
      id: "global-api-error", // prevent toast spamming
    });

    // Authentication Guard
    if (status === 401 || status === 403) {
      console.warn("[AdminAuth] Unauthorized access detected. Please check your credentials.");
      // Logic for redirecting or clearing local storage would go here
    }

    return Promise.reject(error);
  }
);

// ─── Endpoints ───────────────────────────────────────────────────────────────

// Verification Requests
export const getVerificationRequests = (type = "pending", page = 1) => 
  adminApi.get(normalizePath(`/admin/verificationRequest/getAll?type=${type}&page=${page}`));

export const reviewVerification = (id, status, rejectionReason) => 
  adminApi.patch(normalizePath(`/admin/verificationRequest/review?verificationRequestId=${id}`), {
    status,
    rejectionReason,
  });

// Business Categories
export const getBusinessCategories = (isActive) => {
  const query = isActive !== undefined ? `?isActive=${isActive}` : "";
  return adminApi.get(normalizePath(`/admin/business-categories${query}`));
};

export const createBusinessCategory = (data) => 
  adminApi.post(normalizePath("/admin/business-categories"), data);

export const updateBusinessCategory = (id, data) => 
  adminApi.patch(normalizePath(`/admin/business-categories/${id}`), data);

export const deleteBusinessCategory = (id, hard = false) => 
  adminApi.delete(normalizePath(`/admin/business-categories/${id}?hard=${hard}`));

export default adminApi;
