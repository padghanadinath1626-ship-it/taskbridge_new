import React, { useState, useEffect } from 'react';
import LeaveService from '../api/LeaveService';
import { useAuth } from '../auth/useAuth';
import '../styles/AttendanceCalendar.css';

const LeaveRequest = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'CASUAL',
    reason: ''
  });
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [approvedCount, setApprovedCount] = useState(0);

  useEffect(() => {
    fetchMyLeaves();
  }, [user?.id]);

  const fetchMyLeaves = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await LeaveService.getMyLeaves();
      setMyLeaves(response.data || []);

      // Count approved leaves in current month
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const approved = (response.data || []).filter(leave =>
        leave.status === 'APPROVED' &&
        new Date(leave.startDate).getMonth() + 1 === currentMonth &&
        new Date(leave.startDate).getFullYear() === currentYear
      ).length;
      setApprovedCount(approved);
      setError(null);
    } catch (err) {
      setError('Failed to fetch leave records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLeave = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      setError('Please select start and end dates');
      return;
    }

    try {
      setLoading(true);
      await LeaveService.applyForLeave(
        formData.startDate,
        formData.endDate,
        formData.leaveType,
        formData.reason
      );
      setSuccessMessage('Leave request submitted successfully! Waiting for HR approval.');
      setFormData({
        startDate: '',
        endDate: '',
        leaveType: 'CASUAL',
        reason: ''
      });
      fetchMyLeaves();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request leave');
    } finally {
      setLoading(false);
    }
  };

  const getLeaveStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#FFC107';
      case 'APPROVED':
        return '#4CAF50';
      case 'REJECTED':
        return '#dc3545';
      default:
        return '#999';
    }
  };

  const getLeaveStatusBadge = (status) => {
    const icons = {
      PENDING: '⏳',
      APPROVED: '✓',
      REJECTED: '✗'
    };
    return icons[status] || '?';
  };

  const isFreeLeave = approvedCount < 2;

  return (
    <div style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '2rem' }}>
      <h3>🏖️ Leave Request</h3>

      {error && (
        <div style={{
          padding: '10px 15px',
          marginBottom: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{
          padding: '10px 15px',
          marginBottom: '15px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '4px'
        }}>
          {successMessage}
        </div>
      )}

      <div style={{
        backgroundColor: '#f0f8ff',
        padding: '12px',
        marginBottom: '20px',
        borderRadius: '4px',
        border: '1px solid #89CFF0'
      }}>
        <p style={{ margin: '5px 0' }}>
          <strong>📊 Monthly Leave Allowance:</strong> {approvedCount}/2 used
          {approvedCount >= 2 && (
            <span style={{ color: '#dc3545', marginLeft: '10px' }}>
              ⚠️ Additional leaves = Salary Deduction
            </span>
          )}
          {approvedCount < 2 && (
            <span style={{ color: '#4CAF50', marginLeft: '10px' }}>
              ✓ {2 - approvedCount} free leave(s) remaining
            </span>
          )}
        </p>
      </div>

      <form onSubmit={handleRequestLeave}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Leave Type:
          </label>
          <select
            value={formData.leaveType}
            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="CASUAL">Casual Leave</option>
            <option value="SICK">Sick Leave</option>
            <option value="EARNED">Earned Leave</option>
            <option value="MATERNITY">Maternity Leave</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Start Date:
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              End Date:
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Reason:
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Please provide a reason for your leave request"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontFamily: 'inherit',
              minHeight: '80px'
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Submitting...' : 'Request Leave'}
        </button>
      </form>

      <div style={{ marginTop: '30px' }}>
        <h4>📋 My Leave Requests</h4>
        {myLeaves.length > 0 ? (
          <div style={{ display: 'grid', gap: '10px' }}>
            {myLeaves.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)).map(leave => (
              <div
                key={leave.id}
                style={{
                  padding: '12px',
                  border: `2px solid ${getLeaveStatusColor(leave.status)}`,
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '5px 0', fontWeight: '500' }}>
                      {leave.leaveType} - {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                      {leave.reason}
                    </p>
                  </div>
                  <span
                    style={{
                      backgroundColor: getLeaveStatusColor(leave.status),
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {getLeaveStatusBadge(leave.status)} {leave.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#999' }}>No leave requests yet</p>
        )}
      </div>
    </div>
  );
};

export default LeaveRequest;
