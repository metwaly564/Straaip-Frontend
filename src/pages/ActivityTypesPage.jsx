import { useState, useEffect } from "react";
import "./ActivityTypesPage.css";
import { getActivities, createActivity, updateActivity, deleteActivity } from "../api/activities";
import { getBusinessCategories } from "../api/admin";

export default function ActivityTypesPage() {
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [form, setForm] = useState({
    name: { en: "", ar: "", fr: "", it: "" },
    categoryId: "",
    icon: "",
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [actRes, catRes] = await Promise.all([
        getActivities(filterCategory || undefined),
        getBusinessCategories(),
      ]);
      setActivities(actRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setForm({ name: { en: "", ar: "", fr: "", it: "" }, categoryId: "", icon: "", isActive: true });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.en.trim()) return;
    setError(null);
    try {
      if (editingId) {
        await updateActivity(editingId, form);
      } else {
        await createActivity(form);
      }
      resetForm();
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || { en: "", ar: "", fr: "", it: "" },
      categoryId: item.categoryId?._id || item.categoryId || "",
      icon: item.icon || "",
      isActive: item.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await deleteActivity(id);
      setDeleteConfirmId(null);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const getCategoryName = (item) => {
    if (item.categoryId && typeof item.categoryId === "object") return item.categoryId.name?.en || item.categoryId.name || "—";
    const cat = categories.find((c) => c._id === item.categoryId);
    return cat ? (cat.name?.en || cat.name) : "—";
  };

  return (
    <div className="activities-page">
      <header className="page-header-header">
        <div className="header-title-area">
          <h1>Activity Types</h1>
          <p className="subtitle">Business activity classifications for your network</p>
        </div>
        <div className="header-controls">
          <select
            className="filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name?.en || c.name}
              </option>
            ))}
          </select>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="btn-primary-premium">
            <span>+</span> New Activity
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content-glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={resetForm}>&times;</button>
            <form onSubmit={handleSubmit} className="category-form">
              <h3>{editingId ? "Edit Activity" : "New Activity Type"}</h3>
              <div className="form-grid-modern">
                <div className="form-field">
                  <label>English Name</label>
                  <input
                    type="text"
                    value={form.name.en}
                    onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })}
                    placeholder="e.g. Real Estate"
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Arabic Name</label>
                  <input
                    type="text"
                    value={form.name.ar}
                    onChange={(e) => setForm({ ...form, name: { ...form.name, ar: e.target.value } })}
                    placeholder="e.g. عقارات"
                    dir="rtl"
                  />
                </div>
                <div className="form-field">
                  <label>Parent Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="form-select"
                  >
                    <option value="">— Select category —</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name?.en || c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Icon (emoji)</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="e.g. 🏠"
                  />
                </div>
                <div className="form-field centered">
                  <label className="checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer-actions">
                <button type="button" onClick={resetForm} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary-premium" disabled={!form.name.en.trim()}>
                  {editingId ? "Save Changes" : "Create Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="premium-spinner"></div>
          <p>Loading activities...</p>
        </div>
      ) : (
        <div className="table-wrapper-premium">
          <table className="categories-table-main">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Name (EN)</th>
                <th>Name (AR)</th>
                <th>Category</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((item) => (
                <tr key={item._id} className={!item.isActive ? "row-muted" : ""}>
                  <td className="cell-symbol">{item.icon || "—"}</td>
                  <td className="cell-primary">{item.name?.en || "—"}</td>
                  <td className="cell-secondary">{item.name?.ar || "—"}</td>
                  <td className="cell-secondary">{getCategoryName(item)}</td>
                  <td>
                    <span className={`status-pill ${item.isActive ? "active" : "inactive"}`}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-cluster">
                      <button onClick={() => handleEdit(item)} className="btn-table-action edit">Edit</button>
                      {deleteConfirmId === item._id ? (
                        <div className="confirm-stack">
                          <button onClick={() => handleDelete(item._id)} className="btn-table-action confirm">Yes</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="btn-table-action cancel">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirmId(item._id)} className="btn-table-action delete">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {activities.length === 0 && (
            <div className="pure-empty-state">
              <p>No activity types found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
