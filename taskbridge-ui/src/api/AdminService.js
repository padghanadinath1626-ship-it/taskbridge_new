import axiosInstance from '../auth/AuthService';

const AdminService = {
    getAllUsers: async () => {
        const response = await axiosInstance.get('/admin/users');
        return response.data;
    },

    getAllEmployees: async () => {
        const response = await axiosInstance.get('/users/employees');
        return response.data;
    },

    updateUserRole: async (userId, role) => {
        const response = await axiosInstance.put(`/admin/users/${userId}/role`, JSON.stringify(role), {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    },

    deleteUser: async (userId) => {
        await axiosInstance.delete(`/admin/users/${userId}`);
    },

    getAllTasks: async () => {
        const response = await axiosInstance.get('/admin/tasks');
        return response.data;
    },

    deleteTask: async (taskId) => {
        await axiosInstance.delete(`/admin/tasks/${taskId}`);
    },

    reactivateUser: async (userId) => {
        const response = await axiosInstance.post(`/admin/users/${userId}/reactivate`);
        return response.data;
    },

    getAllUsersIncludingInactive: async () => {
        const response = await axiosInstance.get('/admin/users/all');
        return response.data;
    }
};

export default AdminService;
