import { useEffect, useState } from 'react';
import AttendanceService from '../api/AttendanceService';
import AdminService from '../api/AdminService';
import { useAuth } from '../auth/useAuth';
import './AttendanceDashboard.css';

export const AttendanceDashboard = () => {
    const { user } = useAuth();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        fetchUsers();
        if (selectedUserId) {
            fetchAttendanceRecords();
        }
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            fetchAttendanceRecords();
        }
    }, [selectedUserId, startDate, endDate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            let userList = [];
            const getRole = (u) => String(u?.role || '').toUpperCase();
            
            if (user?.role === 'ADMIN') {
                // Admin can see all users
                const response = await AdminService.getAllUsers();
                userList = Array.isArray(response) ? response : (response?.data || []);
                // Filter to only active managers, employees, and HR
                userList = userList.filter(u => u.active && (getRole(u) === 'EMPLOYEE' || getRole(u) === 'MANAGER' || getRole(u) === 'HR'));
            } else if (user?.role === 'MANAGER') {
                // Manager can see employees and HR; also include self
                try {
                    const response = await AdminService.getAllUsers();
                    userList = Array.isArray(response) ? response : (response?.data || []);
                } catch {
                    const response = await AdminService.getAllEmployees();
                    userList = Array.isArray(response) ? response : (response?.data || []);
                }
                userList = userList.filter(u => u.active && (getRole(u) === 'EMPLOYEE' || getRole(u) === 'HR'));
                // add manager self to list if not present
                if (user && user.id) {
                    const exists = userList.some(u => Number(u.id) === Number(user.id));
                    if (!exists) {
                        userList.unshift({ id: user.id, name: user.name, email: user.email, role: user.role, active: user.active });
                    }
                }
            }

            setUsers(userList);
            
            // Auto-select first user if available
            if (userList.length > 0 && !selectedUserId) {
                setSelectedUserId(userList[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            showMessage('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceRecords = async () => {
        if (!selectedUserId) return;

        try {
            setLoading(true);
            const records = await AttendanceService.getUserAttendanceByDateRange(
                selectedUserId,
                startDate,
                endDate
            );
            setAttendanceRecords(Array.isArray(records) ? records : []);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            showMessage('Failed to load attendance records', 'error');
            setAttendanceRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const getSelectedUserName = () => {
        const user = users.find(u => u.id === parseInt(selectedUserId));
        return user?.name || 'Select User';
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const calculateWorkingHours = (record) => {
        if (!record.clockInTime || !record.clockOutTime) return '-';
        
        const clockIn = new Date(record.clockInTime);
        const clockOut = new Date(record.clockOutTime);
        const hours = (clockOut - clockIn) / (1000 * 60 * 60);
        
        return hours.toFixed(2) + ' hrs';
    };

    const getTotalWorkingHours = () => {
        let total = 0;
        attendanceRecords.forEach(record => {
            if (record.clockInTime && record.clockOutTime) {
                const clockIn = new Date(record.clockInTime);
                const clockOut = new Date(record.clockOutTime);
                total += (clockOut - clockIn) / (1000 * 60 * 60);
            }
        });
        return total.toFixed(2) + ' hrs';
    };

    const getPresentDays = () => {
        return attendanceRecords.filter(r => r.status === 'PRESENT').length;
    };

    return (
        <div className="attendance-dashboard-container">
            <div className="attendance-header">
                <h1>📊 Attendance Dashboard</h1>
                <p className="subtitle">View and manage employee attendance records</p>
            </div>

            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}

            <div className="filter-section">
                <div className="filter-group">
                    <label>Select Employee/HR/Manager:</label>
                    <select 
                        value={selectedUserId} 
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Choose a user...</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.name} ({u.role})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>From Date:</label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="filter-group">
                    <label>To Date:</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={loading}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading attendance data...</div>
            ) : selectedUserId ? (
                <>
                    <div className="stats-section">
                        <div className="stat-card">
                            <div className="stat-value">{getPresentDays()}</div>
                            <div className="stat-label">Days Present</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{attendanceRecords.length}</div>
                            <div className="stat-label">Total Records</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{getTotalWorkingHours()}</div>
                            <div className="stat-label">Total Hours</div>
                        </div>
                    </div>

                    <div className="table-section">
                        <h3>Attendance Records - {getSelectedUserName()}</h3>
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Clock In</th>
                                        <th>Clock Out</th>
                                        <th>Hours Worked</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center' }}>
                                                No attendance records found
                                            </td>
                                        </tr>
                                    ) : (
                                        attendanceRecords.map(record => (
                                            <tr key={record.id}>
                                                <td><strong>{formatDate(record.attendanceDate)}</strong></td>
                                                <td>{formatDateTime(record.clockInTime)}</td>
                                                <td>{formatDateTime(record.clockOutTime)}</td>
                                                <td>{calculateWorkingHours(record)}</td>
                                                <td>
                                                    <span className={`status-badge ${record.status.toLowerCase()}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="empty-state">
                    <p>Please select a user to view attendance records</p>
                </div>
            )}
        </div>
    );
};
