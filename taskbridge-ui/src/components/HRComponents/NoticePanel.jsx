import React, { useState, useEffect } from 'react';
import HRService from '../../api/HRService';
import UserService from '../../api/UserService';
import '../styles/HRComponents.css';

const NoticePanel = () => {
  const [employees, setEmployees] = useState([]);
  const [sentNotices, setSentNotices] = useState([]);
  const [formData, setFormData] = useState({
    recipientId: '',
    subject: '',
    content: '',
    noticeType: 'GENERAL'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchSentNotices();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await UserService.getAllActiveUsers();
      setEmployees(response.data.filter(u => u.role !== 'ADMIN'));
    } catch (err) {
      setError('Failed to fetch employees');
    }
  };

  const fetchSentNotices = async () => {
    try {
      setLoading(true);
      const response = await HRService.getNoticesSent();
      setSentNotices(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setError(null);
    } catch (err) {
      setError('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotice = async () => {
    if (!formData.recipientId || !formData.subject || !formData.content) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await HRService.sendNotice(
        parseInt(formData.recipientId),
        formData.subject,
        formData.content,
        formData.noticeType
      );
      setSuccessMessage('Notice sent successfully');
      setFormData({
        recipientId: '',
        subject: '',
        content: '',
        noticeType: 'GENERAL'
      });
      fetchSentNotices();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to send notice');
    } finally {
      setLoading(false);
    }
  };

  const getNoticeTypeColor = (type) => {
    switch (type) {
      case 'GENERAL':
        return '#2196F3';
      case 'ATTENDANCE':
        return '#FF9800';
      case 'SALARY':
        return '#4CAF50';
      case 'CONDUCT':
        return '#f44336';
      case 'PERFORMANCE':
        return '#9C27B0';
      default:
        return '#999';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SENT':
        return '#FFC107';
      case 'READ':
        return '#2196F3';
      case 'ACKNOWLEDGED':
        return '#4CAF50';
      default:
        return '#999';
    }
  };

  const getRecipientName = (recipientId) => {
    const emp = employees.find(e => e.id === recipientId);
    return emp ? emp.name : 'Unknown';
  };

  return (
    <div className="hr-panel">
      <h2>Notice Management</h2>

      <div className="notice-form">
        <h3>Send New Notice</h3>
        <div className="form-group">
          <select 
            value={formData.recipientId}
            onChange={(e) => setFormData({...formData, recipientId: e.target.value})}
            className="select-input"
          >
            <option value="">Select Recipient</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.role})
              </option>
            ))}
          </select>

          <input 
            type="text" 
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            placeholder="Subject"
            className="text-input"
          />

          <select 
            value={formData.noticeType}
            onChange={(e) => setFormData({...formData, noticeType: e.target.value})}
            className="select-input"
          >
            <option value="GENERAL">📢 General</option>
            <option value="ATTENDANCE">📋 Attendance</option>
            <option value="SALARY">💰 Salary</option>
            <option value="CONDUCT">📌 Conduct</option>
            <option value="PERFORMANCE">⭐ Performance</option>
          </select>

          <textarea
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            placeholder="Notice content"
            className="content-textarea"
            rows="6"
          />

          <button 
            onClick={handleSendNotice}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Sending...' : 'Send Notice'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="notices-section">
        <h3>Sent Notices</h3>
        {sentNotices.length > 0 ? (
          <div className="notices-list">
            {sentNotices.map(notice => (
              <div key={notice.id} className="notice-item">
                <div className="notice-info">
                  <h4>{notice.subject}</h4>
                  <p className="recipient"><strong>To:</strong> {getRecipientName(notice.recipient.id)}</p>
                  <p className="content">{notice.content}</p>
                  <div className="notice-meta">
                    <span 
                      className="type-badge"
                      style={{ backgroundColor: getNoticeTypeColor(notice.noticeType) }}
                    >
                      {notice.noticeType}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(notice.status) }}
                    >
                      {notice.status}
                    </span>
                    <span className="date">
                      {new Date(notice.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No notices sent yet</p>
        )}
      </div>
    </div>
  );
};

export default NoticePanel;
