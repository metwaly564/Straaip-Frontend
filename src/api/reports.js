import adminApi from "./admin";
import { normalizePath } from "./config";

/**
 * Reports API
 * Fetch, solve, and delete reports on users, posts, and videos.
 */

export const getReports = (type = 1, startDate, endDate) => {
  const params = new URLSearchParams({ type: String(type) });
  if (startDate && startDate !== "All") params.append("startDate", startDate);
  if (endDate && endDate !== "All") params.append("endDate", endDate);
  return adminApi.get(normalizePath(`/admin/report/getReports?${params.toString()}`));
};

export const solveReport = (reportId) =>
  adminApi.patch(normalizePath(`/admin/report/solveReport?reportId=${reportId}`));

export const deleteReport = (reportId) =>
  adminApi.delete(normalizePath(`/admin/report/deleteReport?reportId=${reportId}`));
