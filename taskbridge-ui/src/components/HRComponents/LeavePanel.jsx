import React, { useState, useEffect } from 'react';
import HRService from '../../api/HRService';
import UserService from '../../api/UserService';
import '../styles/HRComponents.css';

const LeavePanel = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [approverNotes, setApproverNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchPendingLeaves();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await UserService.getAllActiveUsers();
      setEmployees(response.data);
    } catch (err) {
      setError('Failed to fetch employees');
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      const response = await HRService.getAllPendingLeaves();
      setPendingLeaves(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch pending leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      setLoading(true);
      await HRService.approveLeave(leaveId, approverNotes[leaveId] || '');
      setSuccessMessage('Leave approved successfully');
      fetchPendingLeaves();
      setApproverNotes({});
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to approve leave');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      setLoading(true);
      await HRService.rejectLeave(leaveId, approverNotes[leaveId] || '');
      setSuccessMessage('Leave rejected');
      fetchPendingLeaves();
      setApproverNotes({});
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to reject leave');
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (userId) => {
    const emp = employees.find(e => e.id === userId);
    return emp ? emp.name : 'Unknown';
  };

  const filteredLeaves = selectedEmployee 
    ? pendingLeaves.filter(l => l.user.id === selectedEmployee)
    : pendingLeaves;

  return (
    <div className="hr-panel">
      <h2>Leave Management</h2>

      <div className="filter-section">
        <select 
          value={selectedEmployee || ''} 
          onChange={(e) => setSelectedEmployee(e.target.value ? parseInt(e.target.value) : null)}
          className="select-input"
        >
          <option value="">All Employees</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>

        <button 
          onClick={fetchPendingLeaves}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {filteredLeaves.length > 0 ? (
        <div className="leaves-list">
          {filteredLeaves.map(leave => (
            <div key={leave.id} className="leave-card">
              <div className="leave-header">
                <h3>{leave.user.name}</h3>
                <span className="leave-type">{leave.leaveType}</span>
              </div>
              <div className="leave-details">
                <p><strong>From:</strong> {new Date(leave.startDate).toLocaleDateString()}</p>
                <p><strong>To:</strong> {new Date(leave.endDate).toLocaleDateString()}</p>
                <p><strong>Reason:</strong> {leave.reason}</p>
                <p><strong>Status:</strong> {leave.status}</p>
              </div>
              <div className="leave-actions">
                <textarea
                  placeholder="Add notes (optional)"
                  value={approverNotes[leave.id] || ''}
                  onChange={(e) => setApproverNotes({
                    ...approverNotes,
                    [leave.id]: e.target.value
                  })}
                  className="notes-input"
                  rows="2"
                />
                <div className="action-buttons">
                  <button 
                    onClick={() => handleApproveLeave(leave.id)}
                    disabled={loading}
                    className="btn-approve"
                  >
                    ✓ Approve
                  </button>
                  <button 
                    onClick={() => handleRejectLeave(leave.id)}
                    disabled={loading}
                    className="btn-reject"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No pending leave requests</p>
      )}
    </div>
  );
};

export default LeavePanel;
