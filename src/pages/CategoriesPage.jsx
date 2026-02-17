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
        resetForm();
      } else {
        await createCategory(form);
        resetForm();
      }
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
      <h1>Categories</h1>

      <div className="categories-controls">
        <label>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Show inactive
        </label>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="category-form">
        <h2>{editingId ? "Edit Category" : "Create Category"}</h2>
        <div className="form-row">
          <label>
            Name <span className="required">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Category name"
            required
          />
        </div>
        <div className="form-row">
          <label>Image</label>
          <div className="image-upload-row">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
              disabled={uploading}
              className="file-input"
            />
            <span className="upload-hint">
              {uploading ? "Uploading & converting to WebP..." : "Upload from device (auto-converts to WebP)"}
            </span>
          </div>
          <input
            type="url"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="Or paste image URL"
            className="image-url-input"
          />
          {form.image && (
            <img src={form.image} alt="" className="form-preview" onError={(e) => e.target.style.display = "none"} />
          )}
        </div>
        <div className="form-row">
          <label>Icon</label>
          <input
            type="text"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            placeholder="e.g. 🎬"
          />
        </div>
        <div className="form-row checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={!form.name.trim()}>
            {editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="categories-list">
          <h2>Categories ({categories.length})</h2>
          {categories.length === 0 ? (
            <p>No categories found.</p>
          ) : (
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Icon</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id} className={!cat.isActive ? "inactive" : ""}>
                    <td>
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt=""
                          className="category-thumb"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="no-image">—</span>
                      )}
                    </td>
                    <td>{cat.name}</td>
                    <td>{cat.icon || "—"}</td>
                    <td>{cat.isActive ? "Yes" : "No"}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-edit"
                        onClick={() => handleEdit(cat)}
                      >
                        Edit
                      </button>
                      {deleteConfirmId === cat._id ? (
                        <>
                          <button
                            type="button"
                            className="btn-delete-confirm"
                            onClick={() => handleDelete(cat._id)}
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => setDeleteConfirmId(cat._id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
