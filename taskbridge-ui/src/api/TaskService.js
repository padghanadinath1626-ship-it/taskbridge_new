import axiosInstance from '../auth/AuthService';

const TaskService = {
    // Manager: Create a new task
    createTask: async (taskData) => {
        const response = await axiosInstance.post('/tasks', taskData);
        return response.data;
    },

    // Get my tasks (Manager: created, Employee: claimed)
    getMyTasks: async () => {
        const response = await axiosInstance.get('/tasks');
        return response.data;
    },

    // Employee: Get available tasks to claim
    getAvailableTasks: async () => {
        const response = await axiosInstance.get('/tasks/available');
        return response.data;
    },

    // Employee: Claim task
    claimTask: async (taskId) => {
        const response = await axiosInstance.post(`/tasks/${taskId}/claim`);
        return response.data;
    },

    // Update task status
    updateStatus: async (taskId, status) => {
        const response = await axiosInstance.patch(`/tasks/${taskId}/status`, status, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
};

export default TaskService;
