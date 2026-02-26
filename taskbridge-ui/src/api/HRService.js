import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  // User Management (HR accessible)
  getAllActiveEmployees: () =>
    axiosInstance.get(`/hr/users`),

  // Attendance Management
  getEmployeeAttendance: (userId) => 
    axiosInstance.get(`/hr/attendance/user/${userId}`),
  
  getEmployeeAttendanceByDateRange: (userId, startDate, endDate) =>
    axiosInstance.get(`/hr/attendance/user/${userId}/range`, {
      params: { startDate, endDate }
    }),
  
  getAllAttendanceByDateRange: (startDate, endDate) =>
    axiosInstance.get(`/hr/attendance/range`, {
      params: { startDate, endDate }
    }),

  // Leave Management
  applyForLeave: (userId, startDate, endDate, leaveType, reason) =>
    axiosInstance.post(`/hr/leaves/apply`, {
      userId, startDate, endDate, leaveType, reason
    }),

  getAllPendingLeaves: () =>
    axiosInstance.get(`/hr/leaves/pending`),
  
  getEmployeeLeaves: (userId) =>
    axiosInstance.get(`/hr/leaves/user/${userId}`),
  
  getEmployeePendingLeaves: (userId) =>
    axiosInstance.get(`/hr/leaves/user/${userId}/pending`),
  
  approveLeave: (leaveId, notes) =>
    axiosInstance.post(`/hr/leaves/${leaveId}/approve`, { notes }),
  
  rejectLeave: (leaveId, notes) =>
    axiosInstance.post(`/hr/leaves/${leaveId}/reject`, { notes }),
  
  approveLeaveAndEmail: (leaveId, notes) =>
    axiosInstance.post(`/hr/leaves/${leaveId}/approve-with-email`, { notes }),
  
  rejectLeaveAndEmail: (leaveId, notes) =>
    axiosInstance.post(`/hr/leaves/${leaveId}/reject-with-email`, { notes }),
  
  getLeavesInDateRange: (startDate, endDate) =>
    axiosInstance.get(`/leaves/range`, {
      params: { startDate, endDate }
    }),
  
  createRosterEntry: (userId, shiftDate, shiftType, location, notes) =>
    axiosInstance.post(`/hr/roster`, {
      userId, shiftDate, shiftType, location, notes
    }),
  
  getUserRoster: (userId) =>
    axiosInstance.get(`/hr/roster/user/${userId}`),
  
  getUserRosterInDateRange: (userId, startDate, endDate) =>
    axiosInstance.get(`/hr/roster/user/${userId}/range`, {
      params: { startDate, endDate }
    }),
  
  getRosterForDate: (shiftDate) =>
    axiosInstance.get(`/hr/roster/date`, {
      params: { shiftDate }
    }),
  
  getAllRosterInDateRange: (startDate, endDate) =>
    axiosInstance.get(`/hr/roster/range`, {
      params: { startDate, endDate }
    }),
  
  deleteRosterEntry: (rosterId) =>
    axiosInstance.delete(`/hr/roster/${rosterId}`),

  // Notice Management
  sendNotice: (recipientId, subject, content, noticeType) =>
    axiosInstance.post(`/hr/notice`, {
      recipientId, subject, content, noticeType
    }),
  
  getNoticesSent: () =>
    axiosInstance.get(`/hr/notice/sent`),
};
