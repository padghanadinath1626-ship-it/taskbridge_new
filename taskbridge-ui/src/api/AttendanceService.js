import axiosInstance from '../auth/AuthService';

const AttendanceService = {
    // Clock in
    clockIn: async () => {
        const response = await axiosInstance.post('/attendance/clock-in');
        return response.data;
    },

    // Clock out
    clockOut: async () => {
        const response = await axiosInstance.post('/attendance/clock-out');
        return response.data;
    },

    // Get my attendance records
    getMyAttendance: async () => {
        const response = await axiosInstance.get('/attendance/my-attendance');
        return response.data;
    },

    // Get my attendance by date range
    getMyAttendanceByDateRange: async (startDate, endDate) => {
        const response = await axiosInstance.get('/attendance/my-attendance/range', {
            params: { startDate, endDate }
        });
        return response.data;
    },

    // Get today's attendance
    getTodayAttendance: async () => {
        const response = await axiosInstance.get('/attendance/today');
        return response.data;
    },

    // Get user attendance (admin/manager)
    getUserAttendance: async (userId) => {
        const response = await axiosInstance.get(`/attendance/user/${userId}`);
        return response.data;
    },

    // Get user attendance by date range (admin/manager)
    getUserAttendanceByDateRange: async (userId, startDate, endDate) => {
        const response = await axiosInstance.get(`/attendance/user/${userId}/range`, {
            params: { startDate, endDate }
        });
        return response.data;
    }
};

export default AttendanceService;
