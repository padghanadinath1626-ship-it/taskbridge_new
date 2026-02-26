import React, { useState, useEffect } from 'react';
import HRService from '../../api/HRService';
import UserService from '../../api/UserService';
import '../styles/HRComponents.css';

const RosterPanel = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [rosterEntries, setRosterEntries] = useState([]);
  const [formData, setFormData] = useState({
    shiftDate: '',
    shiftType: 'MORNING',
    location: '',
    notes: ''
  });
  const [monthYear, setMonthYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await UserService.getAllActiveUsers();
      setEmployees(response.data);
    } catch (err) {
      setError('Failed to fetch employees');
    }
  };

  const fetchRoster = async () => {
    if (!selectedEmployee) {
      setError('Please select an employee');
      return;
    }

    try {
      setLoading(true);
      const response = await HRService.getUserRoster(selectedEmployee);
      setRosterEntries(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch roster');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoster = async () => {
    if (!selectedEmployee || !formData.shiftDate) {
      setError('Please select employee and date');
      return;
    }

    try {
      setLoading(true);
      await HRService.createRosterEntry(
        selectedEmployee,
        formData.shiftDate,
        formData.shiftType,
        formData.location,
        formData.notes
      );
      setSuccessMessage('Roster entry created/updated successfully');
      setFormData({
        shiftDate: '',
        shiftType: 'MORNING',
        location: '',
        notes: ''
      });
      fetchRoster();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to create roster entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoster = async (rosterId) => {
    if (!window.confirm('Are you sure you want to delete this roster entry?')) {
      return;
    }
    try {
      setLoading(true);
      await HRService.deleteRosterEntry(rosterId);
      setSuccessMessage('Roster entry deleted');
      fetchRoster();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to delete roster entry');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMonthlyRosterAndEmail = async () => {
    if (!selectedEmployee || !monthYear) {
      setError('Please select employee and month');
      return;
    }

    try {
      setLoading(true);
      const [yearStr, monthStr] = monthYear.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const daysInMonth = new Date(year, month, 0).getDate();

      for (let d = 1; d <= daysInMonth; d++) {
        const day = (`0${d}`).slice(-2);
        const m = (`0${month}`).slice(-2);
        const dateStr = `${year}-${m}-${day}`;
        await HRService.createRosterEntry(
          selectedEmployee,
          dateStr,
          formData.shiftType,
          formData.location,
          formData.notes
        );
      }

      await fetchRoster();

        // build roster details as plain-text table and send as ATTENDANCE notice
        try {
          const startDate = `${year}-${(`0${month}`).slice(-2)}-01`;
          const endDate = `${year}-${(`0${month}`).slice(-2)}-${(`0${daysInMonth}`).slice(-2)}`;
          const rosterResp = await HRService.getUserRosterInDateRange(selectedEmployee, startDate, endDate);
          const monthRoster = rosterResp.data || [];
          const header = 'Date | Shift | Location | Notes';
          const lines = [header];
          monthRoster.forEach(r => {
            const date = r.shiftDate;
            const shift = r.shiftType || '';
            const loc = r.location || '';
            const notes = r.notes || '';
            lines.push(`${date} | ${shift} | ${loc} | ${notes}`);
          });
          const rosterDetails = lines.join('\n');
          const subject = `Roster for ${monthYear}`;
          await HRService.sendNotice(selectedEmployee, subject, rosterDetails, 'ATTENDANCE');
        } catch (notifyErr) {
          console.warn('Failed to send roster notice', notifyErr);
        }

      setSuccessMessage('Monthly roster created and notice sent');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError('Failed to create monthly roster');
    } finally {
      setLoading(false);
    }
  };

  const getShiftColor = (shiftType) => {
    switch (shiftType) {
      case 'MORNING':
        return '#FFC107';
      case 'AFTERNOON':
        return '#2196F3';
      case 'NIGHT':
        return '#673AB7';
      case 'OFF':
        return '#9E9E9E';
      default:
        return '#999';
    }
  };

  return (
    <div className="hr-panel">
      <h2>Roster Management</h2>

      <div className="roster-form">
        <h3>Create/Update Roster Entry</h3>
        <div className="form-group">
          <select 
            value={selectedEmployee || ''} 
            onChange={(e) => setSelectedEmployee(e.target.value ? parseInt(e.target.value) : null)}
            className="select-input"
          >
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>

          <input 
            type="date" 
            value={formData.shiftDate}
            onChange={(e) => setFormData({...formData, shiftDate: e.target.value})}
            className="date-input"
          />

          <select 
            value={formData.shiftType}
            onChange={(e) => setFormData({...formData, shiftType: e.target.value})}
            className="select-input"
          >
            <option value="MORNING">🌅 Morning</option>
            <option value="AFTERNOON">☀️ Afternoon</option>
            <option value="NIGHT">🌙 Night</option>
            <option value="OFF">📴 Off</option>
          </select>

          <input 
            type="text" 
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="Location (optional)"
            className="text-input"
          />

          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Notes (optional)"
            className="notes-input"
            rows="2"
          />

          <button 
            onClick={handleCreateRoster}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creating...' : 'Create Entry'}
          </button>
          <input
            type="month"
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            className="month-input"
            style={{ marginLeft: '8px' }}
          />
          <button
            onClick={handleCreateMonthlyRosterAndEmail}
            disabled={loading}
            className="btn-secondary"
            style={{ marginLeft: '8px' }}
          >
            {loading ? 'Processing...' : 'Create Monthly Roster & Send Email'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {selectedEmployee && (
        <div className="roster-section">
          <button 
            onClick={fetchRoster}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? 'Loading...' : 'View Roster'}
          </button>

          {rosterEntries.length > 0 ? (
            <div className="roster-cards">
              {rosterEntries
                .sort((a, b) => new Date(b.shiftDate) - new Date(a.shiftDate))
                .map(entry => (
                  <div key={entry.id} className="roster-card">
                    <div className="roster-header">
                      <h4>{new Date(entry.shiftDate).toLocaleDateString()}</h4>
                      <span 
                        className="shift-badge"
                        style={{ backgroundColor: getShiftColor(entry.shiftType) }}
                      >
                        {entry.shiftType}
                      </span>
                    </div>
                    {entry.location && <p><strong>Location:</strong> {entry.location}</p>}
                    {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>}
                    <button
                      onClick={() => handleDeleteRoster(entry.id)}
                      disabled={loading}
                      className="btn-delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <p className="no-data">No roster entries found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RosterPanel;
