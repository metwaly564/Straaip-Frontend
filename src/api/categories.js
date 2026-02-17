const API_BASE = import.meta.env.VITE_API_URL || "https://admin.straipp.com";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }
  return data;
}

export async function getCategories(all = false) {
  const query = all ? "?all=true" : "";
  return request(`/api/v1/posts/categories${query}`);
}

export async function createCategory(data) {
  return request("/api/v1/posts/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id, data) {
  return request(`/api/v1/posts/categories?categoryId=${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id, hard = false) {
  const query = hard ? `?categoryId=${id}&hard=true` : `?categoryId=${id}`;
  return request(`/api/v1/posts/categories${query}`, {
    method: "DELETE",
  });
}

export async function uploadCategoryImage(file) {
  const url = `${API_BASE}/api/v1/posts/upload-image`;
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Upload failed: ${res.status}`);
  }
  return data;
}
