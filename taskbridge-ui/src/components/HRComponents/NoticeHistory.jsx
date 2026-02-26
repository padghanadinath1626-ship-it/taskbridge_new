import React, { useState, useEffect } from 'react';
import HRService from '../../api/HRService';
import '../styles/HRComponents.css';

const NoticeHistory = () => {
  const [noticeHistory, setNoticeHistory] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // date, name, type

  useEffect(() => {
    fetchNoticeHistory();
  }, []);

  const fetchNoticeHistory = async () => {
    try {
      setLoading(true);
      const response = await HRService.getNoticesSent();
      const notices = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNoticeHistory(notices);
      setFilteredNotices(notices);
      setError(null);
    } catch (err) {
      setError('Failed to fetch notice history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = noticeHistory;

    // Filter by search term (employee name, subject, or content)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(notice =>
        (notice.recipient?.name?.toLowerCase().includes(term)) ||
        (notice.recipient?.email?.toLowerCase().includes(term)) ||
        (notice.subject?.toLowerCase().includes(term)) ||
        (notice.content?.toLowerCase().includes(term))
      );
    }

    // Sort
    if (sortBy === 'name') {
      filtered.sort((a, b) =>
        (a.recipient?.name || '').localeCompare(b.recipient?.name || '')
      );
    } else if (sortBy === 'type') {
      filtered.sort((a, b) =>
        (a.noticeType || '').localeCompare(b.noticeType || '')
      );
    }

    setFilteredNotices(filtered);
  }, [searchTerm, sortBy, noticeHistory]);

  const getStatusBadgeColor = (status) => {
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

  const groupByEmployee = () => {
    const grouped = {};
    filteredNotices.forEach(notice => {
      const empName = notice.recipient?.name || 'Unknown';
      if (!grouped[empName]) {
        grouped[empName] = [];
      }
      grouped[empName].push(notice);
    });
    return grouped;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="hr-panel">
      <h2>Notice History</h2>

      <div className="notice-history-controls" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by employee name, email, subject, or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          style={{
            padding: '10px 15px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            width: '100%',
            maxWidth: '500px',
            marginRight: '10px'
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="select-input"
          style={{
            padding: '10px 15px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            minWidth: '150px'
          }}
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Employee Name</option>
          <option value="type">Sort by Notice Type</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <p>Loading notice history...</p>}

      {!loading && filteredNotices.length > 0 ? (
        <div className="notice-history-container">
          {Object.entries(groupByEmployee()).map(([empName, notices]) => (
            <div key={empName} style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#333', borderBottom: '2px solid #2196F3', paddingBottom: '8px' }}>
                📧 {empName}
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Subject</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '120px' }}>Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '120px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '180px' }}>Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {notices.map(notice => (
                    <tr key={notice.id} style={{ borderBottom: '1px solid #eee', backgroundColor: '#fafafa' }}>
                      <td style={{ padding: '12px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>{notice.subject}</div>
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          maxHeight: '100px',
                          overflow: 'auto',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}>
                          {notice.content}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: getNoticeTypeColor(notice.noticeType),
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {notice.noticeType}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: getStatusBadgeColor(notice.status),
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {notice.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                        {formatDate(notice.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p className="no-data">No notices found</p>
      )}
    </div>
  );
};

export default NoticeHistory;
