import React, { useState, useEffect } from 'react';
import HRService from '../../api/HRService';
import UserService from '../../api/UserService';
import '../styles/HRComponents.css';

const SalaryPanel = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [monthYear, setMonthYear] = useState({});
  const [baseSalary, setBaseSalary] = useState('');
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

  const fetchSalaryRecords = async () => {
    if (!selectedEmployee) {
      setError('Please select an employee');
      return;
    }

    try {
      setLoading(true);
      const response = await HRService.getEmployeeSalaryRecords(selectedEmployee);
      setSalaryRecords(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch salary records');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateSalary = async () => {
    if (!selectedEmployee || !baseSalary) {
      setError('Please select employee and enter base salary');
      return;
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    try {
      setLoading(true);
      await HRService.calculateSalary(
        selectedEmployee,
        year,
        month,
        parseFloat(baseSalary)
      );
      setSuccessMessage('Salary calculated successfully');
      fetchSalaryRecords();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate salary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hr-panel">
      <h2>Salary Management</h2>

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
          type="number" 
          value={baseSalary}
          onChange={(e) => setBaseSalary(e.target.value)}
          placeholder="Base Salary"
          className="number-input"
        />

        <button 
          onClick={handleCalculateSalary}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Calculating...' : 'Calculate Salary'}
        </button>

        <button 
          onClick={fetchSalaryRecords}
          disabled={loading}
          className="btn-secondary"
        >
          {loading ? 'Loading...' : 'View Records'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {salaryRecords.length > 0 ? (
        <div className="salary-table">
          <table>
            <thead>
              <tr>
                <th>Month/Year</th>
                <th>Base Salary</th>
                <th>Present Days</th>
                <th>Absent Days</th>
                <th>Leave Days</th>
                <th>Daily Rate</th>
                <th>Earned Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
              </tr>
            </thead>
            <tbody>
              {salaryRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.month}/{record.year}</td>
                  <td>₹{record.baseSalary.toFixed(2)}</td>
                  <td>{record.presentDays}</td>
                  <td>{record.absentDays}</td>
                  <td>{record.leaveDays}</td>
                  <td>₹{record.salaryPerDay.toFixed(2)}</td>
                  <td>₹{record.earnedSalary.toFixed(2)}</td>
                  <td>₹{record.deductions.toFixed(2)}</td>
                  <td style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                    ₹{record.netSalary.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        selectedEmployee && !loading && <p className="no-data">No salary records found</p>
      )}
    </div>
  );
};

export default SalaryPanel;
