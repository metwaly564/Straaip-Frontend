import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getVerificationRequests, reviewVerification } from "../api/admin";
import "./VerificationPage.css";

/**
 * Verification Management Page
 * Handles approval/rejection of business verification requests.
 */

export default function VerificationPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getVerificationRequests(activeTab);
      // res.data should be an array of requests
      const data = Array.isArray(res.data) ? res.data : [];
      setRequests(data);
    } catch (err) {
      console.error("[Verification] Fetch failed:", err);
      // Response interceptor handles the toast notification
    } finally {
      setLoading(false);
    }
  };


  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this verification request?")) return;

    try {
      await reviewVerification(id, "APPROVED");
      toast.success("Verification approved successfully!");
      fetchRequests();
    } catch (err) {
      // Interceptor handles toast
    }
  };

  const openRejectModal = (id) => {
    setSelectedRequestId(id);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    setSubmitting(true);
    try {
      await reviewVerification(selectedRequestId, "REJECTED", rejectionReason.trim());
      toast.success("Verification rejected.");
      setIsRejectModalOpen(false);
      fetchRequests();
    } catch (err) {
      // Interceptor handles toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="verification-page">
      <header className="page-header">
        <h1>Verification Requests</h1>
        <p>Manage and review business account verification documents.</p>
      </header>

      {/* Tab Filters */}
      <div className="tab-navigation" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {['pending', 'approved', 'rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab ? '#6366f1' : '#f1f5f9',
              color: activeTab === tab ? 'white' : '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p>Loading requests...</p>
          </div>
        ) : (
          <table className="verification-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Business Type</th>
                <th>Request Date</th>
                <th>Documents</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No requests found in this category.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <div className="user-info">
                        <img 
                           src={req.userId?.image || "https://ui-avatars.com/api/?name=" + (req.userId?.name || "User")} 
                           className="user-avatar" 
                           alt=""
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{req.userId?.name || "Unknown"}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>@{req.userId?.userName}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.875rem' }}>
                        {req.userId?.businessSubtype || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="doc-links">
                        {req.nationalIdDoc && (
                          <a href={req.nationalIdDoc} target="_blank" rel="noreferrer" className="btn-doc">ID Card</a>
                        )}
                        {req.commercialRegistrationDoc && (
                          <a href={req.commercialRegistrationDoc} target="_blank" rel="noreferrer" className="btn-doc">Commercial</a>
                        )}
                        {req.profileSelfie && (
                          <a href={req.profileSelfie} target="_blank" rel="noreferrer" className="btn-doc">Selfie</a>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.status === "PENDING" ? (
                        <div className="action-group">
                          <button onClick={() => handleApprove(req._id)} className="btn-approve">Approve</button>
                          <button onClick={() => openRejectModal(req._id)} className="btn-reject">Reject</button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Processed</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Rejection Modal */}
      {isRejectModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRejectModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Verification</h3>
            <p>Please provide a mandatory reason for rejecting this request. This will be visible to the user.</p>
            
            <textarea
              placeholder="e.g. Documents are blurry or expired..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              autoFocus
            />

            <div className="modal-actions">
              <button 
                onClick={() => setIsRejectModalOpen(false)} 
                className="btn-modal-cancel"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectSubmit} 
                className="btn-modal-submit"
                disabled={submitting || !rejectionReason.trim()}
              >
                {submitting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
