import React, { useState, useEffect } from 'react';
import HRService from '../../api/HRService';
import UserService from '../../api/UserService';
import '../styles/HRComponents.css';

const NoticePanel = () => {
  const [employees, setEmployees] = useState([]);
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
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await UserService.getAllActiveUsers();
      setEmployees(response.data.filter(u => u.role !== 'ADMIN'));
    } catch (err) {
      setError('Failed to fetch employees');
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
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to send notice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hr-panel">
      <h2>Send Notice</h2>

      <div className="notice-form">
        <h3>Compose New Notice</h3>
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
    </div>
  );
};

export default NoticePanel;
