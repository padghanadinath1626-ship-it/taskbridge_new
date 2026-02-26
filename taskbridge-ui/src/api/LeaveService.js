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
  // Get my leaves
  getMyLeaves: () =>
    axiosInstance.get(`/leaves/my-leaves`),

  // Get my pending leaves
  getMyPendingLeaves: () =>
    axiosInstance.get(`/leaves/my-leaves/pending`),

  // Apply for leave
  applyForLeave: (startDate, endDate, leaveType, reason) =>
    axiosInstance.post(`/leaves/apply`, {
      startDate, endDate, leaveType, reason
    }),

  // Get leaves in date range (for calendar)
  getLeavesInDateRange: (startDate, endDate) =>
    axiosInstance.get(`/leaves/range`, {
      params: { startDate, endDate }
    }),
};
