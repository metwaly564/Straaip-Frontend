import { useState, useEffect } from "react";
import "./ReportsPage.css";
import { getReports, solveReport, deleteReport } from "../api/reports";

const REPORT_TYPES = [
  { label: "User Reports", value: 1 },
  { label: "Post Reports", value: 2 },
  { label: "Video Reports", value: 3 },
];

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeType, setActiveType] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReports(activeType);
      setReports(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSolve = async (id) => {
    setActionLoading(id);
    try {
      await solveReport(id);
      await fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      await deleteReport(id);
      await fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getReportedName = (report) => {
    if (report.userId) return report.userId.name || report.userId.userName || "Unknown";
    return "—";
  };

  const getReportedContent = (report) => {
    if (report.videoId) return `Video: ${report.videoId.caption || report.videoId._id}`;
    if (report.postId) return `Post: ${report.postId._id}`;
    if (report.userId) return `User: ${report.userId.name || report.userId._id}`;
    return "—";
  };

  return (
    <div className="reports-page">
      <header className="page-header-header">
        <div className="header-title-area">
          <h1>Reports</h1>
          <p className="subtitle">Review and manage user-submitted reports</p>
        </div>
      </header>

      <div className="report-tabs">
        {REPORT_TYPES.map((rt) => (
          <button
            key={rt.value}
            className={`report-tab ${activeType === rt.value ? "active" : ""}`}
            onClick={() => setActiveType(rt.value)}
          >
            {rt.label}
          </button>
        ))}
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
          <p>Loading reports...</p>
        </div>
      ) : (
        <div className="table-wrapper-premium">
          <table className="categories-table-main">
            <thead>
              <tr>
                <th>#</th>
                <th>Reporter</th>
                <th>Reported Content</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, idx) => (
                <tr key={report._id}>
                  <td className="cell-secondary">{idx + 1}</td>
                  <td className="cell-primary">
                    {report.reportByUserId?.name || report.reportByUserId?.userName || "—"}
                  </td>
                  <td className="cell-secondary">{getReportedContent(report)}</td>
                  <td className="cell-secondary">
                    {report.reportReasonId?.reason || report.description || "—"}
                  </td>
                  <td className="cell-secondary">
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <span className={`status-pill ${report.isSolved ? "active" : "pending"}`}>
                      {report.isSolved ? "Resolved" : "Pending"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-cluster">
                      {!report.isSolved && (
                        <button
                          onClick={() => handleSolve(report._id)}
                          className="btn-table-action solve"
                          disabled={actionLoading === report._id}
                        >
                          {actionLoading === report._id ? "..." : "Resolve"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(report._id)}
                        className="btn-table-action delete"
                        disabled={actionLoading === report._id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && (
            <div className="pure-empty-state">
              <p>No reports found for this category</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
