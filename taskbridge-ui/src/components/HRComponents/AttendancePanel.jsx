import React, { useState, useEffect } from 'react';
import HRService from '../../api/HRService';
import UserService from '../../api/UserService';
import '../styles/HRComponents.css';

const AttendancePanel = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAllActiveUsers();
      setEmployees(response.data.filter(u => u.role === 'EMPLOYEE' || u.role === 'MANAGER'));
      setError(null);
    } catch (err) {
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedEmployee) {
      setError('Please select an employee');
      return;
    }

    try {
      setLoading(true);
      let response;
      if (startDate && endDate) {
        response = await HRService.getEmployeeAttendanceByDateRange(
          selectedEmployee,
          startDate,
          endDate
        );
      } else {
        response = await HRService.getEmployeeAttendance(selectedEmployee);
      }
      setAttendance(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return '#4CAF50';
      case 'ABSENT':
        return '#f44336';
      case 'ON_LEAVE':
        return '#2196F3';
      default:
        return '#999';
    }
  };

  return (
    <div className="hr-panel">
      <h2>Attendance Management</h2>

      <div className="filter-section">
        <select 
          value={selectedEmployee || ''} 
          onChange={(e) => setSelectedEmployee(e.target.value ? parseInt(e.target.value) : null)}
          className="select-input"
        >
          <option value="">Select Employee</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.email})
            </option>
          ))}
        </select>

        <input 
          type="date" 
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
          className="date-input"
        />

        <input 
          type="date" 
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
          className="date-input"
        />

        <button 
          onClick={fetchAttendance}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Loading...' : 'View Attendance'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {attendance.length > 0 ? (
        <div className="attendance-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(record => (
                <tr key={record.id}>
                  <td>{new Date(record.attendanceDate).toLocaleDateString()}</td>
                  <td>{record.clockInTime ? new Date(record.clockInTime).toLocaleTimeString() : '-'}</td>
                  <td>{record.clockOutTime ? new Date(record.clockOutTime).toLocaleTimeString() : '-'}</td>
                  <td>
                    <span style={{ 
                      color: getStatusColor(record.status),
                      fontWeight: 'bold'
                    }}>
                      {record.status}
                    </span>
                  </td>
                  <td>{record.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        selectedEmployee && !loading && <p className="no-data">No attendance records found</p>
      )}
    </div>
  );
};

export default AttendancePanel;
