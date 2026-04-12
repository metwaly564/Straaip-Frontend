import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { 
  getBusinessCategories, 
  createBusinessCategory, 
  deleteBusinessCategory,
  updateBusinessCategory 
} from "../api/admin";
import "./BusinessCategoriesPage.css";

/**
 * Business Categories Page
 * Handles management of commercial activity groupings.
 * State matches the Mongoose i18n schema.
 */

export default function BusinessCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Form State following the "i18n Trap" advice
  const [form, setForm] = useState({
    name: {
      en: "",
      ar: ""
    },
    icon: "",
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getBusinessCategories();
      // res.data is { categories: [] }
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.error("[BusinessCategory] Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };


  const resetForm = () => {
    setForm({ name: { en: "", ar: "" }, icon: "", isActive: true });
    setEditingId(null);
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setForm({
      name: { 
        en: cat.name?.en || "", 
        ar: cat.name?.ar || "" 
      },
      icon: cat.icon || "",
      isActive: cat.isActive ?? true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name.en.trim() || !form.name.ar.trim()) {
      toast.error("Both English and Arabic names are required.");
      return;
    }

    try {
      if (editingId) {
        await updateBusinessCategory(editingId, form);
        toast.success("Category updated!");
      } else {
        await createBusinessCategory(form);
        toast.success("Category created!");
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      // Interceptor handles toast message
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this category?")) return;
    
    try {
      await deleteBusinessCategory(id);
      toast.success("Category deactivated.");
      fetchCategories();
    } catch (err) {
      // Interceptor handles toast
    }
  };

  return (
    <div className="business-categories-page">
      <header className="page-header">
        <h1>Business Categories</h1>
        <p>Define top-level groupings for commercial activities.</p>
      </header>

      <div className="category-layout">
        {/* Form Panel */}
        <div className="category-card">
          <h3>{editingId ? "Edit Category" : "Add New Category"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name (English)</label>
              <input
                type="text"
                placeholder="e.g. Retail"
                value={form.name.en}
                onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })}
              />
            </div>

            <div className="form-group">
              <label>Name (Arabic)</label>
              <input
                type="text"
                placeholder="e.g. قطاع التجزئة"
                dir="rtl"
                value={form.name.ar}
                onChange={(e) => setForm({ ...form, name: { ...form.name, ar: e.target.value } })}
              />
            </div>

            <div className="form-group">
              <label>Icon (Emoji or String)</label>
              <input
                type="text"
                placeholder="e.g. 🛍️"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="isActive"
                style={{ width: 'auto' }}
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <label htmlFor="isActive" style={{ marginBottom: 0 }}>Is Active</label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {editingId ? "Save Changes" : "Create Category"}
              </button>
              {editingId && (
                <button type="button" className="btn-reset" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Panel */}
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-state"><div className="spinner"></div></div>
          ) : (
            <table className="category-table">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Name (EN)</th>
                  <th>Name (AR)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No categories yet.</td></tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat._id} className={!cat.isActive ? "row-inactive" : ""}>
                      <td className="icon-display">{cat.icon || "—"}</td>
                      <td style={{ fontWeight: 600 }}>{cat.name?.en}</td>
                      <td>{cat.name?.ar}</td>
                      <td>
                         <span style={{ 
                           fontSize: '0.75rem', 
                           fontWeight: 600, 
                           color: cat.isActive ? '#10b981' : '#ef4444' 
                         }}>
                           {cat.isActive ? "ACTIVE" : "INACTIVE"}
                         </span>
                      </td>
                      <td>
                        <button className="action-btn-small" onClick={() => handleEdit(cat)}>Edit</button>
                        <button className="action-btn-small delete" onClick={() => handleDelete(cat._id)}>Disable</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
