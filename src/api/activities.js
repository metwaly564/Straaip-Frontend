import adminApi from "./admin";
import { normalizePath } from "./config";

/**
 * Activity Types API
 * CRUD operations for Activity Types (admin-managed business activities).
 */

export const getActivities = (categoryId, isActive) => {
  const params = new URLSearchParams();
  if (categoryId) params.append("categoryId", categoryId);
  if (isActive !== undefined) params.append("isActive", isActive);
  const query = params.toString() ? `?${params.toString()}` : "";
  return adminApi.get(normalizePath(`/admin/activities${query}`));
};

export const createActivity = (data) =>
  adminApi.post(normalizePath("/admin/activities"), data);

export const updateActivity = (id, data) =>
  adminApi.patch(normalizePath(`/admin/activities/${id}`), data);

export const deleteActivity = (id, hard = false) =>
  adminApi.delete(normalizePath(`/admin/activities/${id}?hard=${hard}`));
