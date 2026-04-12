import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE, normalizePath } from "./config";

const clientApi = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor for global error handling
clientApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || "An unexpected error occurred.";
    toast.error(message, { id: "client-api-error" });
    return Promise.reject(error);
  }
);

/**
 * Check if a handle (@nickname) is available
 */
export const checkNicknameAvailability = (userName) => 
  clientApi.get(normalizePath(`/v1/user/check-nickname?userName=${userName}`));

/**
 * Register a new business account
 */
export const registerBusinessAccount = (data) => 
  clientApi.post(normalizePath("/v1/user/register"), data);

/**
 * Fetch available activities (Business classifications)
 * Using adminApi to ensure headers are included for production compatibility.
 */
import adminApi from "./admin";
export const getActivities = (isActive = true) => 
  adminApi.get(normalizePath(`/admin/activities?isActive=${isActive}`));

/**
 * Fetch interests (Content preferences)
 */
export const getInterests = () => 
  clientApi.get(normalizePath("/interests"));

/**
 * Save user interests
 */
export const saveUserInterests = (interestIds, token) => 
  clientApi.post(normalizePath("/v1/user/interests"), { interestIds }, {
    headers: { Authorization: `Bearer ${token}` }
  });

export default clientApi;
