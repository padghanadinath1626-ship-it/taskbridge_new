import { useState, useEffect } from 'react';
import AttendanceService from '../api/AttendanceService';
import '../styles/AttendanceCalendar.css';

export const AttendanceCalendar = ({ userId = null }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAttendanceData();
    }, [currentDate, userId]);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const startDate = new Date(year, month, 1).toISOString().split('T')[0];
            const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

            let records;
            if (userId) {
                records = await AttendanceService.getUserAttendanceByDateRange(userId, startDate, endDate);
            } else {
                records = await AttendanceService.getMyAttendanceByDateRange(startDate, endDate);
            }

            setAttendanceData(Array.isArray(records) ? records : []);
        } catch (error) {
            console.error('Failed to fetch attendance data:', error);
            setAttendanceData([]);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getAttendanceForDate = (day) => {
        const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return attendanceData.find(record => record.attendanceDate === dateString);
    };

    const getStatusColor = (status) => {
        const colors = {
            PRESENT: '#28a745',
            ABSENT: '#dc3545',
            ON_LEAVE: '#ffc107'
        };
        return colors[status] || '#6c757d';
    };

    const getStatusIcon = (status) => {
        const icons = {
            PRESENT: '✓',
            ABSENT: '✗',
            ON_LEAVE: '—'
        };
        return icons[status] || '?';
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    return (
        <div className="attendance-calendar">
            <div className="calendar-header">
                <h3>📅 Attendance Calendar</h3>
                <div className="calendar-controls">
                    <button onClick={previousMonth} className="nav-btn">❮ Prev</button>
                    <button onClick={goToToday} className="today-btn">Today</button>
                    <button onClick={nextMonth} className="nav-btn">Next ❯</button>
                </div>
            </div>

            <div className="month-year">{monthYear}</div>

            {loading && <div className="loading">Loading calendar...</div>}

            <div className="calendar-container">
                <div className="weekdays">
                    <div className="weekday">Sun</div>
                    <div className="weekday">Mon</div>
                    <div className="weekday">Tue</div>
                    <div className="weekday">Wed</div>
                    <div className="weekday">Thu</div>
                    <div className="weekday">Fri</div>
                    <div className="weekday">Sat</div>
                </div>

                <div className="days-grid">
                    {days.map((day, index) => {
                        if (day === null) {
                            return <div key={`empty-${index}`} className="day empty"></div>;
                        }

                        const attendance = getAttendanceForDate(day);
                        const status = attendance?.status || 'ABSENT';
                        const hasClockIn = attendance?.clockInTime;

                        return (
                            <div
                                key={day}
                                className={`day ${status.toLowerCase()} ${hasClockIn ? 'present' : ''}`}
                                style={{
                                    borderLeftColor: attendance ? getStatusColor(status) : '#ddd'
                                }}
                                title={attendance ? `${status}${hasClockIn ? ' - Clocked in' : ''}` : 'No data'}
                            >
                                <div className="day-number">{day}</div>
                                {attendance && (
                                    <div className="day-status" style={{ color: getStatusColor(status) }}>
                                        {getStatusIcon(status)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="legend-color present"></div>
                    <span>Present</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color absent"></div>
                    <span>Absent</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color on_leave"></div>
                    <span>On Leave</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color empty"></div>
                    <span>No Data</span>
                </div>
            </div>
        </div>
    );
};
