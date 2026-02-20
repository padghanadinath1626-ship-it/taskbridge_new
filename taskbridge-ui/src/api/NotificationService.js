import axiosInstance from '../auth/AuthService';

const NotificationService = {
    // Send notification
    sendNotification: async (request) => {
        const response = await axiosInstance.post('/notifications', request);
        return response.data;
    },

    // Get my notifications
    getMyNotifications: async () => {
        const response = await axiosInstance.get('/notifications');
        return response.data;
    },

    // Get unread notifications
    getUnreadNotifications: async () => {
        const response = await axiosInstance.get('/notifications/unread');
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
        return response.data;
    },

    // Get allowed recipients based on user's role
    getAllowedRecipients: async () => {
        const response = await axiosInstance.get('/notifications/allowed-recipients');
        return response.data;
    },

    // Get my attendance by date range (for calendar)
    getMyAttendanceByDateRange: async (startDate, endDate) => {
        const response = await axiosInstance.get('/attendance/my-attendance/range', {
            params: { startDate, endDate }
        });
        return response.data;
    }
};

export default NotificationService;
