import adminApi from "./admin";
import { normalizePath } from "./config";

/**
 * Users API (Admin)
 * Get, block, and delete user accounts.
 */

export const getUsers = (type = "real", search, page = 1, limit = 20) => {
  const params = new URLSearchParams({ type, page: String(page), limit: String(limit) });
  if (search) params.append("search", search);
  return adminApi.get(normalizePath(`/admin/user/getUsers?${params.toString()}`));
};

export const getUserProfile = (userId) =>
  adminApi.get(normalizePath(`/admin/user/getProfile?userId=${userId}`));

export const blockUser = (userId) =>
  adminApi.patch(normalizePath(`/admin/user/isBlock?userId=${userId}`));

export const deleteUsers = (userIds) =>
  adminApi.delete(normalizePath("/admin/user/deleteUsers"), {
    data: { userId: Array.isArray(userIds) ? userIds.join(",") : userIds },
  });
