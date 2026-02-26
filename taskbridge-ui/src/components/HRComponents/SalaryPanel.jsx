import React, { useState, useEffect } from 'react';
import HRService from '../../api/HRService';
import UserService from '../../api/UserService';
import '../styles/HRComponents.css';
import { jsPDF } from 'jspdf';

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

  const handleGenerateAndSendSlip = async () => {
    if (!selectedEmployee) {
      setError('Please select employee');
      return;
    }

    try {
      setLoading(true);
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const resp = await HRService.getSalaryForMonth(selectedEmployee, year, month);
      const record = resp.data;
      if (!record) {
        setError('No salary record found for selected month');
        return;
      }

      const emp = employees.find(e => e.id === selectedEmployee) || {};
      const subject = `Salary Slip - ${record.month}/${record.year}`;
      const content = `Dear ${emp.name || 'Employee'},\n\nPlease find your salary details for ${record.month}/${record.year}:\n\nBase Salary: ₹${record.baseSalary.toFixed(2)}\nPresent Days: ${record.presentDays}\nAbsent Days: ${record.absentDays}\nLeave Days: ${record.leaveDays}\nEarned Salary: ₹${record.earnedSalary.toFixed(2)}\nDeductions: ₹${record.deductions.toFixed(2)}\nNet Salary: ₹${record.netSalary.toFixed(2)}\n\nRegards,\nHR Team`;

      try {
        await HRService.sendNotice(selectedEmployee, subject, content, 'SALARY');
      } catch (notifyErr) {
        console.warn('Failed to send salary notice', notifyErr);
      }

      // generate PDF for local download
      try {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text(`Salary Slip - ${record.month}/${record.year}`, 105, 20, { align: 'center' });
        doc.setFontSize(11);
        let y = 36;
        doc.text(`Name: ${emp.name || ''}`, 20, y);
        doc.text(`Email: ${emp.email || ''}`, 140, y);
        y += 8;
        doc.text(`Base Salary: ₹${record.baseSalary.toFixed(2)}`, 20, y);
        y += 8;
        doc.text(`Present Days: ${record.presentDays}`, 20, y);
        doc.text(`Absent Days: ${record.absentDays}`, 100, y);
        y += 8;
        doc.text(`Leave Days: ${record.leaveDays}`, 20, y);
        doc.text(`Earned Salary: ₹${record.earnedSalary.toFixed(2)}`, 100, y);
        y += 8;
        doc.text(`Deductions: ₹${record.deductions.toFixed(2)}`, 20, y);
        doc.text(`Net Salary: ₹${record.netSalary.toFixed(2)}`, 100, y);
        y += 16;
        doc.text('This is a system generated salary slip.', 20, y);
        const filename = `salary_slip_${record.month}_${record.year}.pdf`;
        doc.save(filename);
      } catch (pdfErr) {
        console.warn('Failed to generate PDF', pdfErr);
      }

      setSuccessMessage('Salary slip generated and notice sent');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setError('Failed to generate/send salary slip');
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
          onClick={handleGenerateAndSendSlip}
          disabled={loading}
          className="btn-secondary"
          style={{ marginLeft: '8px' }}
        >
          {loading ? 'Processing...' : 'Generate & Send Salary Slip'}
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
