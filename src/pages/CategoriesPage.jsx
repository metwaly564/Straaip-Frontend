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
    nameAr: "",
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
    setForm({ name: "", nameAr: "", image: "", icon: "", isActive: true });
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
      nameAr: cat.nameAr || "",
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
      <header className="page-header-header">
        <div className="header-title-area">
          <h1>Video Categories</h1>
          <p className="subtitle">Manage and organize your platform's video themes</p>
        </div>
        
        <div className="header-controls">
          <label className="show-inactive-toggle">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            <span className="toggle-label">Show inactive</span>
          </label>
          <button onClick={handleOpenAddModal} className="btn-primary-premium">
            <span>+</span> New Category
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Modal Overlay omitted for brevity in replace, keeping existing structure but ensuring classes match */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content-glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={resetForm}>&times;</button>
            <form onSubmit={handleSubmit} className="category-form">
              <h3>{editingId ? "Edit Category" : "New Category"}</h3>

              <div className="form-grid-modern">
                <div className="form-field">
                  <label>English Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Technology"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Arabic Name</label>
                  <input
                    type="text"
                    value={form.nameAr}
                    onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                    placeholder="e.g. تكنولوجيا"
                    dir="rtl"
                  />
                </div>

                <div className="form-field full-width">
                  <label>Cover Image URL</label>
                  <div className="input-with-upload">
                    <input
                      type="url"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://..."
                    />
                    <input
                      type="file"
                      id="upload-img"
                      hidden
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="upload-img" className="mini-upload-btn">
                      {uploading ? "..." : "Upload"}
                    </label>
                  </div>
                </div>

                <div className="form-field">
                  <label>Display Icon</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="Emoji or path"
                  />
                </div>

                <div className="form-field centered">
                  <label className="checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <span>Visible to users</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" onClick={resetForm} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary-premium" disabled={!form.name.trim()}>
                  {editingId ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="premium-spinner"></div>
          <p>Syncing categories...</p>
        </div>
      ) : (
        <div className="table-wrapper-premium">
          <table className="categories-table-main">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Identity</th>
                <th>Localized</th>
                <th>Symbol</th>
                <th>Visibility</th>
                <th className="text-right">Manage</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className={!cat.isActive ? "row-muted" : ""}>
                  <td>
                    <div className="thumb-container">
                      {cat.image ? (
                        <img src={cat.image} alt="" className="table-thumb-circle" />
                      ) : (
                        <div className="table-thumb-empty">?</div>
                      )}
                    </div>
                  </td>
                  <td className="cell-primary">{cat.name}</td>
                  <td className="cell-secondary">{cat.nameAr || "—"}</td>
                  <td className="cell-symbol">{cat.icon || "—"}</td>
                  <td>
                    <span className={`status-pill ${cat.isActive ? 'active' : 'inactive'}`}>
                      {cat.isActive ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-cluster">
                      <button onClick={() => handleEdit(cat)} className="btn-table-action edit">
                        Edit
                      </button>
                      {deleteConfirmId === cat._id ? (
                        <div className="confirm-stack">
                          <button onClick={() => handleDelete(cat._id)} className="btn-table-action confirm">Delete</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="btn-table-action cancel">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirmId(cat._id)} className="btn-table-action delete">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="pure-empty-state">
              <p>No video categories found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

