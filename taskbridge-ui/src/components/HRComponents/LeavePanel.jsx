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
  const [approvedLeaveCount, setApprovedLeaveCount] = useState({});
  const [sendEmailMode, setSendEmailMode] = useState({});

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

      // Calculate approved leaves per employee per month
      const counts = {};
      response.data.forEach(leave => {
        if (leave.user && leave.status === 'APPROVED') {
          const key = `${leave.user.id}-${new Date(leave.startDate).getMonth()}-${new Date(leave.startDate).getFullYear()}`;
          counts[key] = (counts[key] || 0) + 1;
        }
      });
      setApprovedLeaveCount(counts);
      setError(null);
    } catch (err) {
      setError('Failed to fetch pending leaves');
    } finally {
      setLoading(false);
    }
  };

  const countApprovedLeavesDays = (leave) => {
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    return daysDiff;
  };

  const handleApproveLeave = async (leaveId, withEmail = false) => {
    try {
      setLoading(true);
      if (withEmail) {
        // Send with email notification
        await HRService.approveLeave(leaveId, approverNotes[leaveId] || '');
        // Send notice/email
        const leave = pendingLeaves.find(l => l.id === leaveId);
        const emp = employees.find(e => e.id === leave.user.id) || {};
        const subject = `Leave Request Approved`;
        const content = `Dear ${emp.name || 'Employee'},\n\nYour leave request for ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been APPROVED.\n\nLeave Type: ${leave.leaveType}\nDays: ${countApprovedLeavesDays(leave)}\n\nNote: First 2 leaves per month are unpaid. Additional leaves will have salary deduction.\n\nRegards,\nHR Team`;
        try {
          await HRService.sendNotice(leave.user.id, subject, content, 'GENERAL');
        } catch (notifyErr) {
          console.warn('Failed to send email', notifyErr);
        }
      } else {
        await HRService.approveLeave(leaveId, approverNotes[leaveId] || '');
      }
      setSuccessMessage('Leave approved successfully');
      fetchPendingLeaves();
      setApproverNotes({});
      setSendEmailMode({});
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to approve leave');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectLeave = async (leaveId, withEmail = false) => {
    try {
      setLoading(true);
      if (withEmail) {
        // Send with email notification
        await HRService.rejectLeave(leaveId, approverNotes[leaveId] || '');
        // Send notice/email
        const leave = pendingLeaves.find(l => l.id === leaveId);
        const emp = employees.find(e => e.id === leave.user.id) || {};
        const subject = `Leave Request Rejected`;
        const content = `Dear ${emp.name || 'Employee'},\n\nYour leave request for ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been REJECTED.\n\nLeave Type: ${leave.leaveType}\n\nNote: ${approverNotes[leaveId] || 'No additional notes provided.'}\n\nYou will be marked as ABSENT for these dates.\n\nRegards,\nHR Team`;
        try {
          await HRService.sendNotice(leave.user.id, subject, content, 'GENERAL');
        } catch (notifyErr) {
          console.warn('Failed to send email', notifyErr);
        }
      } else {
        await HRService.rejectLeave(leaveId, approverNotes[leaveId] || '');
      }
      setSuccessMessage('Leave rejected');
      fetchPendingLeaves();
      setApproverNotes({});
      setSendEmailMode({});
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
                <p><strong>Days:</strong> {countApprovedLeavesDays(leave)}</p>
                <p><strong>Reason:</strong> {leave.reason}</p>
                <p><strong>Status:</strong> {leave.status}</p>
                <div style={{
                  marginTop: '10px',
                  padding: '8px',
                  backgroundColor: '#f0f8ff',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#333'
                }}>
                  💡 First 2 approved leaves/month = No deduction. Additional leaves = Salary deduction
                </div>
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
                <div className="action-buttons" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {!sendEmailMode[leave.id] ? (
                    <>
                      <button
                        onClick={() => setSendEmailMode({ ...sendEmailMode, [leave.id]: true })}
                        disabled={loading}
                        className="btn-secondary"
                      >
                        ✓ Approve & Email
                      </button>
                      <button
                        onClick={() => setApproverNotes({
                          ...approverNotes,
                          [leave.id]: approverNotes[leave.id] || 'Not meeting criteria'
                        }) || setSendEmailMode({ ...sendEmailMode, [leave.id]: false })}
                        disabled={loading}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        ✗ Reject & Email
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApproveLeave(leave.id, true)}
                        disabled={loading}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        📧 Send Approval Email
                      </button>
                      <button
                        onClick={() => handleRejectLeave(leave.id, true)}
                        disabled={loading}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        📧 Send Rejection Email
                      </button>
                      <button
                        onClick={() => setSendEmailMode({ ...sendEmailMode, [leave.id]: false })}
                        disabled={loading}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
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
