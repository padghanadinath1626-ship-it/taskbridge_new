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
  // Get all active users (via HR endpoint - works for HR users)
  getAllActiveUsers: () =>
    axiosInstance.get(`/hr/users`),
  
  // Get all active users (via Admin endpoint - works only for ADMIN users)
  getAllActiveUsersAdmin: () =>
    axiosInstance.get(`/admin/users`),
  
  // Get all users including inactive
  getAllUsers: () =>
    axiosInstance.get(`/admin/users/all`),
  
  // Get user by ID
  getUserById: (userId) =>
    axiosInstance.get(`/admin/users/${userId}`),
  
  // Update user role
  updateUserRole: (userId, role) =>
    axiosInstance.put(`/admin/users/${userId}/role`, { role }),
  
  // Delete user
  deleteUser: (userId) =>
    axiosInstance.delete(`/admin/users/${userId}`),
  
  // Reactivate user
  reactivateUser: (userId) =>
    axiosInstance.post(`/admin/users/${userId}/reactivate`),
};
