export const API_BASE = import.meta.env.VITE_API_URL || "https://admin.straipp.com";

/**
 * Ensures an asset URL is absolute.
 * If the URL is relative, it prefixes it with API_BASE.
 */
export function getAssetUrl(url) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
        return url;
    }
    // Remove leading slash if present to avoid double slashes
    const cleanPath = url.startsWith("/") ? url.slice(1) : url;
    return `${API_BASE}/${cleanPath}`;
}

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

export async function getVideos(params = {}) {
    const { categoryId, interestId, page = 1, limit = 10 } = params;
    let query = `?page=${page}&limit=${limit}`;
    if (categoryId) query += `&categoryId=${categoryId}`;
    if (interestId) query += `&interestId=${interestId}`;
    return request(`/api/v1/posts/videos${query}`);
}

export async function createVideo(data) {
    return request("/api/v1/posts/videos", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateVideo(id, data) {
    return request(`/api/v1/posts/videos?videoId=${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function deleteVideo(id) {
    return request(`/api/v1/posts/videos?videoId=${id}`, {
        method: "DELETE",
    });
}
