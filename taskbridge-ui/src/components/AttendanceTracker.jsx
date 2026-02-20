import { useEffect, useState } from 'react';
import AttendanceService from '../api/AttendanceService';

export const AttendanceTracker = () => {
    const [clockedIn, setClockedIn] = useState(false);
    const [clockInTime, setClockInTime] = useState(null);
    const [clockOutTime, setClockOutTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        fetchTodayAttendance();
    }, []);

    const fetchTodayAttendance = async () => {
        try {
            setLoading(true);
            const attendance = await AttendanceService.getTodayAttendance();
            if (attendance) {
                setClockedIn(true);
                setClockInTime(attendance.clockInTime);
                setClockOutTime(attendance.clockOutTime);
            } else {
                setClockedIn(false);
            }
        } catch (error) {
            console.error('Failed to fetch today attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClockIn = async () => {
        try {
            setLoading(true);
            const result = await AttendanceService.clockIn();
            setClockedIn(true);
            setClockInTime(result.clockInTime);
            setMessage('Clocked in successfully!', 'success');
            showMessage('Clocked in successfully!', 'success');
        } catch (error) {
            const errMsg = error?.response?.data?.message || error?.message || 'Failed to clock in';
            showMessage(errMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        try {
            setLoading(true);
            const result = await AttendanceService.clockOut();
            setClockOutTime(result.clockOutTime);
            showMessage('Clocked out successfully!', 'success');
        } catch (error) {
            const errMsg = error?.response?.data?.message || error?.message || 'Failed to clock out';
            showMessage(errMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const formatTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString();
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '2rem' }}>
            <h3>⏰ Attendance Tracker</h3>
            
            {message && (
                <div style={{ 
                    padding: '0.75rem', 
                    marginBottom: '1rem', 
                    borderRadius: '4px',
                    backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
                    color: messageType === 'success' ? '#155724' : '#721c24'
                }}>
                    {message}
                </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
                <p><strong>Clock In Time:</strong> {formatTime(clockInTime)}</p>
                <p><strong>Clock Out Time:</strong> {formatTime(clockOutTime)}</p>
                <p><strong>Status:</strong> {clockedIn && !clockOutTime ? '🟢 Working' : clockOutTime ? '🔴 Off Duty' : '⚪ Not Clocked In'}</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                    onClick={handleClockIn}
                    disabled={clockedIn || loading}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: clockedIn ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: clockedIn ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    ▶ Clock In
                </button>

                <button 
                    onClick={handleClockOut}
                    disabled={!clockedIn || clockOutTime || loading}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: !clockedIn || clockOutTime ? '#ccc' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !clockedIn || clockOutTime ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    ⏹ Clock Out
                </button>
            </div>
        </div>
    );
};
