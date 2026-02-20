import { useEffect, useState } from 'react';
import TaskService from '../api/TaskService';
import AdminService from '../api/AdminService';
import { useAuth } from '../auth/useAuth';
import { TaskPanel } from '../components/TaskPanel';
import { SendMessageModal } from '../components/SendMessageModal';
import { AttendanceTracker } from '../components/AttendanceTracker';
import './Dashboard.css';

export const Dashboard = () => {
    const { user } = useAuth();
    const [myTasks, setMyTasks] = useState([]);
    const [availableTasks, setAvailableTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my-tasks');
    const [selectedTask, setSelectedTask] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [users, setUsers] = useState([]);

    // Form state
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', deadline: '' });

    useEffect(() => {
        fetchTasks();
        if (user?.role === 'MANAGER') {
            fetchUsers();
        }
    }, [user?.role]);

    const fetchUsers = async () => {
        try {
            const allUsers = await AdminService.getAllEmployees();
            const userList = Array.isArray(allUsers) ? allUsers : (allUsers?.data || []);
            setUsers(userList);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchTasks = async () => {
        setLoading(true);
        try {
            if (user.role === 'MANAGER') {
                const my = await TaskService.getMyTasks();
                setMyTasks(my);
                setAvailableTasks([]);
            } else if (user.role === 'EMPLOYEE') {
                const my = await TaskService.getMyTasks();
                const available = await TaskService.getAvailableTasks();
                setMyTasks(my);
                setAvailableTasks(available);
            }
        } catch (error) {
            showMessage('Failed to fetch tasks', 'error');
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const taskData = {
                title: newTask.title,
                description: newTask.description,
                priority: newTask.priority,
            };

            if (newTask.deadline && newTask.deadline.trim() !== '') {
                taskData.deadline = new Date(newTask.deadline).toISOString();
            }

            await TaskService.createTask(taskData);
            showMessage('Task created successfully!', 'success');
            setNewTask({ title: '', description: '', priority: 'MEDIUM', deadline: '' });
            fetchTasks();
        } catch (error) {
            showMessage('Failed to create task: ' + (error.response?.data?.message || error.message), 'error');
            console.error('Create task error:', error);
        }
    };

    const handleClaimTask = async (taskId) => {
        try {
            await TaskService.claimTask(taskId);
            showMessage('Task claimed successfully!', 'success');
            fetchTasks();
            setSelectedTask(null);
        } catch (error) {
            showMessage('Failed to claim task', 'error');
        }
    };

    const handleStatusUpdate = async (taskId, status) => {
        try {
            await TaskService.updateStatus(taskId, status);
            showMessage(`Task status updated to ${status}`, 'success');
            fetchTasks();
            setSelectedTask(null);
        } catch (error) {
            showMessage('Failed to update status', 'error');
        }
    };

    const renderTaskActions = (task) => {
        if (user.role === 'EMPLOYEE') {
            return (
                <div className="actions">
                    {task.status !== 'IN_PROGRESS' && (
                        <button className="action-btn primary" onClick={() => handleStatusUpdate(task.id, 'IN_PROGRESS')}>
                            Start
                        </button>
                    )}
                    {task.status !== 'COMPLETED' && (
                        <button className="action-btn success" onClick={() => handleStatusUpdate(task.id, 'COMPLETED')}>
                            Complete
                        </button>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard - {user.role}</h1>
                <p className="user-role">Welcome, {user.name}</p>
            </div>

            {user.role === 'EMPLOYEE' && (
                <div style={{ marginBottom: '1rem' }}>
                    <button
                        className="message-btn"
                        onClick={() => setShowMessageModal(true)}
                        title="Send a message to your manager or admin"
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        💬 Message Manager / Admin
                    </button>
                </div>
            )}

            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}

            {/* TABS FOR EMPLOYEE */}
            {user.role === 'EMPLOYEE' && (
                <div className="tabs">
                    <button className={activeTab === 'my-tasks' ? 'active' : ''} onClick={() => setActiveTab('my-tasks')}>
                        My Tasks
                    </button>
                    <button className={activeTab === 'available' ? 'active' : ''} onClick={() => setActiveTab('available')}>
                        Available Tasks
                    </button>
                </div>
            )}

            {/* ATTENDANCE TRACKER (EMPLOYEE & MANAGER) */}
            {(user.role === 'EMPLOYEE' || user.role === 'MANAGER') && <AttendanceTracker />}

            {/* CREATE TASK (MANAGER) */}
            {user.role === 'MANAGER' && (
                <div className="create-task-section">
                    <h3>Create New Task</h3>
                    <form onSubmit={handleCreateTask}>
                        <div className="form-row">
                            <input
                                type="text"
                                placeholder="Task Title"
                                value={newTask.title}
                                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <textarea
                                placeholder="Task Description"
                                value={newTask.description}
                                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                required
                                rows="3"
                            />
                        </div>
                        <div className="form-row">
                            <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                                <option value="LOW">Low Priority</option>
                                <option value="MEDIUM">Medium Priority</option>
                                <option value="HIGH">High Priority</option>
                            </select>
                            <input
                                type="datetime-local"
                                value={newTask.deadline}
                                onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="create-btn">Create Task</button>
                    </form>
                    <button 
                        className="message-btn"
                        onClick={() => setShowMessageModal(true)}
                        title="Send a message or instruction to an employee"
                    >
                        💬 Send Message to Employee
                    </button>
                </div>
            )}

            {/* TASK LISTS */}
            {loading ? (
                <div className="loading">Loading tasks...</div>
            ) : (
                <div className="task-lists">
                    {(user.role === 'MANAGER' || user.role === 'EMPLOYEE') && (
                        <div className="task-group">
                            <h3>{user.role === 'MANAGER' ? 'My Created Tasks' : 'My Claimed Tasks'}</h3>
                            {myTasks.length === 0 ? (
                                <div className="empty-state">
                                    <p>No tasks found</p>
                                </div>
                            ) : (
                                <div className="task-grid">
                                    {myTasks.map(task => (
                                        <div
                                            key={task.id}
                                            className={`task-card ${task.priority.toLowerCase()}`}
                                            onClick={() => setSelectedTask(task)}
                                        >
                                            <div className="task-header">
                                                <h4>{task.title}</h4>
                                                <span className={`status ${task.status}`}>{task.status}</span>
                                            </div>
                                            <p className="task-description">{task.description}</p>
                                            <div className="task-meta">
                                                <span className={`priority ${task.priority.toLowerCase()}`}>
                                                    {task.priority}
                                                </span>
                                                {task.deadline && (
                                                    <span className="deadline">
                                                        {new Date(task.deadline).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            {user.role === 'EMPLOYEE' && renderTaskActions(task)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {user.role === 'EMPLOYEE' && activeTab === 'available' && (
                        <div className="task-group">
                            <h3>Available Tasks to Claim</h3>
                            {availableTasks.length === 0 ? (
                                <div className="empty-state">
                                    <p>No available tasks</p>
                                </div>
                            ) : (
                                <div className="task-grid">
                                    {availableTasks.map(task => (
                                        <div
                                            key={task.id}
                                            className={`task-card ${task.priority.toLowerCase()}`}
                                            onClick={() => setSelectedTask(task)}
                                        >
                                            <div className="task-header">
                                                <h4>{task.title}</h4>
                                                <span className={`status ${task.status}`}>{task.status}</span>
                                            </div>
                                            <p className="task-description">{task.description}</p>
                                            <div className="task-meta">
                                                <span className={`priority ${task.priority.toLowerCase()}`}>
                                                    {task.priority}
                                                </span>
                                                {task.deadline && (
                                                    <span className="deadline">
                                                        {new Date(task.deadline).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="creator">Created by: {task.creator?.name}</p>
                                            <button
                                                className="claim-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleClaimTask(task.id);
                                                }}
                                            >
                                                Claim Task
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Task Detail Panel */}
            {selectedTask && (
                <TaskPanel
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onAction={renderTaskActions(selectedTask)}
                />
            )}

            {/* Send Message Modal for Managers */}
            {showMessageModal && (
                <SendMessageModal 
                    users={users}
                    onClose={() => setShowMessageModal(false)}
                    onSuccess={(msg) => {
                        showMessage(msg, 'success');
                    }}
                />
            )}
        </div>
    );
};
