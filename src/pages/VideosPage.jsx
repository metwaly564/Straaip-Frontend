import { useState, useEffect } from "react";
import "./VideosPage.css";
import { getVideos, createVideo, updateVideo, deleteVideo } from "../api/videos";
import { getCategories } from "../api/categories";

export default function VideosPage() {
    const [videos, setVideos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [form, setForm] = useState({
        caption: "",
        videoUrl: "",
        videoImage: "",
        videoTime: 0,
        price: 0,
        categoryId: "",
    });

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [vRes, cRes] = await Promise.all([getVideos(), getCategories(true)]);
            setVideos(vRes.data || []);
            setCategories(cRes.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetForm = () => {
        setForm({
            caption: "",
            videoUrl: "",
            videoImage: "",
            videoTime: 0,
            price: 0,
            categoryId: "",
        });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.videoUrl.trim()) return;
        setError(null);
        try {
            if (editingId) {
                await updateVideo(editingId, form);
            } else {
                await createVideo(form);
            }
            resetForm();
            await fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (video) => {
        setEditingId(video._id);
        setForm({
            caption: video.caption || "",
            videoUrl: video.videoUrl || "",
            videoImage: video.videoImage || "",
            videoTime: video.videoTime || 0,
            price: video.price || 0,
            categoryId: video.categoryId?._id || video.categoryId || "",
        });
    };

    const handleDelete = async (id) => {
        setError(null);
        try {
            await deleteVideo(id);
            setDeleteConfirmId(null);
            await fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="videos-page">
            <h1>Videos Management</h1>

            {error && (
                <div className="error-message" role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="video-form">
                <h2>{editingId ? "Edit Video" : "Add New Video"}</h2>

                <div className="form-grid">
                    <div className="form-row">
                        <label>Caption</label>
                        <input
                            type="text"
                            value={form.caption}
                            onChange={(e) => setForm({ ...form, caption: e.target.value })}
                            placeholder="Video caption"
                        />
                    </div>

                    <div className="form-row">
                        <label>Category <span className="required">*</span></label>
                        <select
                            value={form.categoryId}
                            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <label>Video URL <span className="required">*</span></label>
                        <input
                            type="url"
                            value={form.videoUrl}
                            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                            placeholder="https://..."
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label>Thumbnail / Cover Image URL</label>
                        <input
                            type="url"
                            value={form.videoImage}
                            onChange={(e) => setForm({ ...form, videoImage: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="form-row">
                        <label>Duration (seconds)</label>
                        <input
                            type="number"
                            value={form.videoTime}
                            onChange={(e) => setForm({ ...form, videoTime: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="form-row">
                        <label>Price</label>
                        <input
                            type="number"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary">
                        {editingId ? "Update Video" : "Save Video"}
                    </button>
                    <button type="button" onClick={resetForm} className="btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>

            {loading ? (
                <p>Loading videos...</p>
            ) : (
                <div className="videos-list">
                    <h2>All Videos ({videos.length})</h2>
                    <div className="video-cards">
                        {videos.map((video) => (
                            <div key={video._id} className="video-card">
                                <div className="video-preview">
                                    {video.videoImage ? (
                                        <img src={video.videoImage} alt={video.caption} />
                                    ) : (
                                        <div className="no-image-placeholder">No Image</div>
                                    )}
                                    <div className="video-duration">{video.videoTime}s</div>
                                </div>
                                <div className="video-info">
                                    <h3>{video.caption || "No Caption"}</h3>
                                    <p className="video-meta">
                                        <span className="category-tag">
                                            {video.categoryId?.icon} {video.categoryId?.name || "Uncategorized"}
                                        </span>
                                        <span className="price-tag">${video.price}</span>
                                    </p>
                                    <div className="card-actions">
                                        <button onClick={() => handleEdit(video)} className="btn-edit">Edit</button>
                                        {deleteConfirmId === video._id ? (
                                            <div className="confirm-group">
                                                <button onClick={() => handleDelete(video._id)} className="btn-confirm">Sure?</button>
                                                <button onClick={() => setDeleteConfirmId(null)} className="btn-cancel">No</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setDeleteConfirmId(video._id)} className="btn-delete">Delete</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
