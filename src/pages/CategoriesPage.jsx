import { useState, useEffect } from "react";
import "./CategoriesPage.css";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
} from "../api/categories";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    image: "",
    icon: "",
    isActive: true,
  });

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCategories(showInactive);
      setCategories(res.data || []);
    } catch (err) {
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [showInactive]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setForm({ name: "", image: "", icon: "", isActive: true });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, GIF, or WebP).");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const res = await uploadCategoryImage(file);
      setForm((prev) => ({ ...prev, image: res.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setError(null);
    try {
      if (editingId) {
        await updateCategory(editingId, form);
      } else {
        await createCategory(form);
      }
      resetForm();
      await fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name,
      image: cat.image || "",
      icon: cat.icon || "",
      isActive: cat.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await deleteCategory(id);
      setDeleteConfirmId(null);
      await fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="categories-page">
      <header className="page-header">
        <div className="header-content">
          <h1>Categories</h1>
          <p className="subtitle">Manage video categories and branding</p>
        </div>
        <div className="header-actions">
          <label className="toggle-inactive">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Show inactive
          </label>
          <button onClick={handleOpenAddModal} className="btn-add-main">
            <span className="plus-icon">+</span> New Category
          </button>
        </div>
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
            <form onSubmit={handleSubmit} className="category-form">
              <h2>{editingId ? "Edit Category" : "Create Category"}</h2>

              <div className="form-grid">
                <div className="form-row span-2">
                  <label>Name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter category name"
                    required
                  />
                </div>

                <div className="form-row span-2">
                  <label>Cover Image</label>
                  <div className="upload-container">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden-file-input"
                      id="cat-image"
                    />
                    <label htmlFor="cat-image" className="upload-btn-secondary">
                      {uploading ? "Converting..." : "Upload Image"}
                    </label>
                    <input
                      type="url"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="Or paste URL"
                      className="url-input-small"
                    />
                  </div>
                  {form.image && <img src={form.image} className="preview-small" />}
                </div>

                <div className="form-row">
                  <label>Icon (Emoji)</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="e.g. 🍔"
                  />
                </div>

                <div className="form-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    Is Active
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={!form.name.trim()}>
                  {editingId ? "Update Category" : "Save Category"}
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
          <p>Loading categories...</p>
        </div>
      ) : (
        <div className="categories-list-section">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Icon</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className={!cat.isActive ? "row-inactive" : ""}>
                  <td>
                    {cat.image ? (
                      <img src={cat.image} alt="" className="table-thumb" />
                    ) : (
                      <div className="table-thumb-placeholder">?</div>
                    )}
                  </td>
                  <td className="font-bold">{cat.name}</td>
                  <td className="text-xl">{cat.icon || "—"}</td>
                  <td>
                    <span className={`status-badge ${cat.isActive ? 'active' : 'inactive'}`}>
                      {cat.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => handleEdit(cat)} className="icon-btn edit">Edit</button>
                      {deleteConfirmId === cat._id ? (
                        <>
                          <button onClick={() => handleDelete(cat._id)} className="icon-btn confirm">Sure?</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="icon-btn cancel">No</button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteConfirmId(cat._id)} className="icon-btn delete">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="empty-state">No categories found.</div>
          )}
        </div>
      )}
    </div>
  );
}
