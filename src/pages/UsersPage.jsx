import { useState, useEffect } from "react";
import "./UsersPage.css";
import { getUsers, blockUser, deleteUsers } from "../api/users";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userType, setUserType] = useState("real");
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers(userType, searchTerm || undefined);
      setUsers(res.user || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleBlock = async (userId) => {
    setActionLoading(userId);
    try {
      await blockUser(userId);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    setActionLoading(userId);
    try {
      await deleteUsers(userId);
      setDeleteConfirmId(null);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="users-page">
      <header className="page-header-header">
        <div className="header-title-area">
          <h1>User Management</h1>
          <p className="subtitle">Approve, block, or delete user accounts</p>
        </div>
      </header>

      <div className="users-toolbar">
        <div className="report-tabs">
          {[
            { label: "Real Users", value: "real" },
            { label: "Fake Users", value: "fake" },
          ].map((t) => (
            <button
              key={t.value}
              className={`report-tab ${userType === t.value ? "active" : ""}`}
              onClick={() => setUserType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="search-input"
          />
          <button type="submit" className="btn-primary-premium search-btn">Search</button>
        </form>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="premium-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="table-wrapper-premium">
          <table className="categories-table-main">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Username</th>
                <th>Email / Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className={user.isBlock ? "row-muted" : ""}>
                  <td>
                    <div className="thumb-container">
                      {user.image && !user.image.includes("undefined") ? (
                        <img src={user.image} alt="" className="table-thumb-circle" />
                      ) : (
                        <div className="table-thumb-empty">
                          {(user.name || "?")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="cell-primary">{user.name || "—"}</td>
                  <td className="cell-secondary">{user.userName || "—"}</td>
                  <td className="cell-secondary">
                    <div>{user.email || "—"}</div>
                    {user.mobileNumber && <div className="cell-sub">{user.mobileNumber}</div>}
                  </td>
                  <td className="cell-secondary">{user.role || "user"}</td>
                  <td>
                    {user.isBlock ? (
                      <span className="status-pill blocked">Blocked</span>
                    ) : (
                      <span className="status-pill active">Active</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="action-cluster">
                      <button
                        onClick={() => handleBlock(user._id)}
                        className={`btn-table-action ${user.isBlock ? "solve" : "block-btn"}`}
                        disabled={actionLoading === user._id}
                      >
                        {actionLoading === user._id ? "..." : user.isBlock ? "Unblock" : "Block"}
                      </button>
                      {deleteConfirmId === user._id ? (
                        <div className="confirm-stack">
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="btn-table-action confirm"
                            disabled={actionLoading === user._id}
                          >
                            Yes
                          </button>
                          <button onClick={() => setDeleteConfirmId(null)} className="btn-table-action cancel">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirmId(user._id)} className="btn-table-action delete">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="pure-empty-state">
              <p>No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
