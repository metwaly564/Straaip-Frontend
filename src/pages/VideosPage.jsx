import { useState, useEffect } from "react";
import "./VideosPage.css";
import { getVideos, createVideo, updateVideo, deleteVideo } from "../api/videos";
import { getCategories } from "../api/categories";

export default function VideosPage() {
    const [videos, setVideos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
        setIsModalOpen(false);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setIsModalOpen(true);
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
        setIsModalOpen(true);
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
            <header className="page-header">
                <div className="header-content">
                    <h1>Videos</h1>
                    <p className="subtitle">Manage and categorize your video library</p>
                </div>
                <button onClick={handleOpenAddModal} className="btn-add-main">
                    <span className="plus-icon">+</span> New Video
                </button>
            </header>

            {error && (
                <div className="error-message" role="alert">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={resetForm}>&times;</button>
                        <form onSubmit={handleSubmit} className="video-form">
                            <h2>{editingId ? "Edit Video" : "Add New Video"}</h2>

                            <div className="form-grid">
                                <div className="form-row">
                                    <label>Caption</label>
                                    <input
                                        type="text"
                                        value={form.caption}
                                        onChange={(e) => setForm({ ...form, caption: e.target.value })}
                                        placeholder="Describe your video..."
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
                                        placeholder="https://example.com/video.mp4"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <label>Thumbnail URL</label>
                                    <input
                                        type="url"
                                        value={form.videoImage}
                                        onChange={(e) => setForm({ ...form, videoImage: e.target.value })}
                                        placeholder="https://example.com/cover.jpg"
                                    />
                                </div>

                                <div className="form-row">
                                    <label>Duration (s)</label>
                                    <input
                                        type="number"
                                        value={form.videoTime}
                                        onChange={(e) => setForm({ ...form, videoTime: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="form-row">
                                    <label>Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-save">
                                    {editingId ? "Update Changes" : "Save Video"}
                                </button>
                                <button type="button" onClick={resetForm} className="btn-cancel-form">
                                    Discard
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading your videos...</p>
                </div>
            ) : (
                <section className="videos-list-section">
                    <div className="list-header">
                        <h2>Library ({videos.length})</h2>
                    </div>

                    {videos.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📂</span>
                            <p>No videos found. Start by adding one!</p>
                        </div>
                    ) : (
                        <div className="video-cards-grid">
                            {videos.map((video) => (
                                <div key={video._id} className="premium-video-card">
                                    <div className="video-prev-container">
                                        {video.videoImage ? (
                                            <img src={video.videoImage} alt={video.caption} className="card-thumb" />
                                        ) : (
                                            <div className="thumb-placeholder">
                                                <span className="play-icon">▶</span>
                                            </div>
                                        )}
                                        <div className="card-badges">
                                            <span className="duration-badge">{video.videoTime}s</span>
                                            {video.price > 0 && <span className="price-badge">${video.price}</span>}
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <h3>{video.caption || "Untitled Video"}</h3>
                                        <div className="card-meta">
                                            <span className="category-pill">
                                                {video.categoryId?.icon || "📽"} {video.categoryId?.name || "General"}
                                            </span>
                                        </div>
                                        <div className="card-footer">
                                            <button onClick={() => handleEdit(video)} className="action-btn edit-btn">
                                                Edit
                                            </button>
                                            {deleteConfirmId === video._id ? (
                                                <div className="confirm-actions">
                                                    <button onClick={() => handleDelete(video._id)} className="confirm-btn">Yes</button>
                                                    <button onClick={() => setDeleteConfirmId(null)} className="deny-btn">No</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setDeleteConfirmId(video._id)} className="action-btn delete-btn">
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
