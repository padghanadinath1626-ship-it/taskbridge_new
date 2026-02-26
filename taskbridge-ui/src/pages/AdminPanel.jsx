import { useEffect, useState } from 'react';
import AdminService from '../api/AdminService';
import { useAuth } from '../auth/useAuth';
import { SendMessageModal } from '../components/SendMessageModal';
import './AdminPanel.css';

export const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('stats');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [loading, setLoading] = useState(true);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showInactiveUsers, setShowInactiveUsers] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            setLoading(false);
            return;
        }
        loadData();
    }, [user?.id]);

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            loadData();
        }
    }, [showInactiveUsers]);

    const loadData = async () => {
        setLoading(true);
        try {
            let u;
            if (showInactiveUsers) {
                u = await AdminService.getAllUsersIncludingInactive();
            } else {
                u = await AdminService.getAllUsers();
            }
            const usersPayload = Array.isArray(u) ? u : (u?.data || u?.users || []);
            setUsers(usersPayload);

            const t = await AdminService.getAllTasks();
            const tasksPayload = Array.isArray(t) ? t : (t?.data || t?.tasks || []);
            setTasks(tasksPayload);
        } catch (error) {
            const errMsg = error?.response?.data?.message || error?.message || 'Failed to load data';
            showMessage(errMsg, 'error');
            console.error('Admin loadData error:', error);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleRoleUpdate = async (userId, newRole) => {
        if (window.confirm(`Are you sure you want to update this user's role to ${newRole}?`)) {
            try {
                await AdminService.updateUserRole(userId, newRole);
                showMessage('User role updated successfully', 'success');
                loadData();
            } catch (error) {
                showMessage('Failed to update role', 'error');
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Are you sure? This will deactivate the user.")) {
            try {
                await AdminService.deleteUser(userId);
                showMessage('User deactivated successfully', 'success');
                loadData();
            } catch (error) {
                showMessage('Failed to deactivate user', 'error');
            }
        }
    };

    const handleReactivateUser = async (userId) => {
        if (window.confirm("Are you sure you want to reactivate this user?")) {
            try {
                await AdminService.reactivateUser(userId);
                showMessage('User reactivated successfully', 'success');
                loadData();
            } catch (error) {
                showMessage('Failed to reactivate user', 'error');
            }
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm("Are you sure? This will delete the task.")) {
            try {
                await AdminService.deleteTask(taskId);
                showMessage('Task deleted successfully', 'success');
                loadData();
            } catch (error) {
                showMessage('Failed to delete task', 'error');
            }
        }
    };

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.active).length;
    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    const managerCount = users.filter(u => u.role === 'MANAGER').length;
    const employeeCount = users.filter(u => u.role === 'EMPLOYEE').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const assignedTasks = tasks.filter(t => t.manager !== null).length;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Admin Control Panel</h1>
                <p className="subtitle">Manage users, tasks, and system monitoring</p>
            </div>

            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
                <button 
                    className="btn-send-message"
                    onClick={() => setShowMessageModal(true)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        marginRight: '1rem'
                    }}
                >
                    💬 Send Notice/Message
                </button>
            </div>

            {!user || user.role !== 'ADMIN' ? (
                <div className="access-denied">
                    <h2>Access Denied</h2>
                    <p>Only administrators can access this panel. Your current role: <strong>{user?.role || 'Unknown'}</strong></p>
                </div>
            ) : (
                <>
                    <div className="tabs">
                        <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>
                            Dashboard
                        </button>
                        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                            User Management
                        </button>
                        <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
                            System Tasks
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <>
                            {activeTab === 'stats' && (
                                <div className="stats-container">
                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <div className="stat-value">{totalUsers}</div>
                                            <div className="stat-label">Total Users</div>
                                            <div className="stat-meta">{activeUsers} active</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{adminCount}</div>
                                            <div className="stat-label">Administrators</div>
                                            <div className="stat-meta">ADMIN role</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{managerCount}</div>
                                            <div className="stat-label">Managers</div>
                                            <div className="stat-meta">MANAGER role</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{employeeCount}</div>
                                            <div className="stat-label">Employees</div>
                                            <div className="stat-meta">EMPLOYEE role</div>
                                        </div>
                                    </div>

                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <div className="stat-value">{totalTasks}</div>
                                            <div className="stat-label">Total Tasks</div>
                                            <div className="stat-meta">{assignedTasks} assigned</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{inProgressTasks}</div>
                                            <div className="stat-label">In Progress</div>
                                            <div className="stat-meta">Currently active</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{completedTasks}</div>
                                            <div className="stat-label">Completed</div>
                                            <div className="stat-meta">{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{totalTasks - assignedTasks}</div>
                                            <div className="stat-label">Unassigned</div>
                                            <div className="stat-meta">Awaiting assignment</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <>
                                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={showInactiveUsers}
                                                onChange={(e) => setShowInactiveUsers(e.target.checked)}
                                            />
                                            Show Inactive Users
                                        </label>
                                    </div>
                                    <div className="table-responsive">
                                    <table className="user-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'center' }}>No users found</td>
                                                </tr>
                                            ) : (
                                                users.map(u => (
                                                    <tr key={u.id}>
                                                        <td>{u.id}</td>
                                                        <td><strong>{u.name}</strong></td>
                                                        <td>{u.email}</td>
                                                        <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                                        <td>
                                                            <span className={`status-badge ${u.active ? 'active' : 'inactive'}`}>
                                                                {u.active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                {u.active && u.role !== 'ADMIN' && (
                                                                    <button onClick={() => handleRoleUpdate(u.id, 'ADMIN')} className="btn-promote">
                                                                        Make Admin
                                                                    </button>
                                                                )}
                                                                {u.active && u.role !== 'MANAGER' && (
                                                                    <button onClick={() => handleRoleUpdate(u.id, 'MANAGER')} className="btn-promote">
                                                                        Make Manager
                                                                    </button>
                                                                )}
                                                                {u.active && u.role !== 'EMPLOYEE' && (
                                                                    <button onClick={() => handleRoleUpdate(u.id, 'EMPLOYEE')} className="btn-promote">
                                                                        Make Employee
                                                                    </button>
                                                                )}
                                                                {u.active ? (
                                                                    <button onClick={() => handleDeleteUser(u.id)} className="btn-delete" title="Deactivate user">
                                                                        Deactivate
                                                                    </button>
                                                                ) : (
                                                                    <button onClick={() => handleReactivateUser(u.id)} className="btn-activate" title="Reactivate user">
                                                                        Reactivate
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                    </div>
                                </>
                            )}

                            {activeTab === 'tasks' && (
                                <div className="table-responsive">
                                    <table className="task-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Title</th>
                                                <th>Status</th>
                                                <th>Priority</th>
                                                <th>Creator</th>
                                                <th>Manager</th>
                                                <th>Deadline</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" style={{ textAlign: 'center' }}>No tasks found</td>
                                                </tr>
                                            ) : (
                                                tasks.map(t => (
                                                    <tr key={t.id}>
                                                        <td>{t.id}</td>
                                                        <td><strong>{t.title}</strong></td>
                                                        <td><span className={`status ${t.status}`}>{t.status}</span></td>
                                                        <td><span className={`priority ${t.priority?.toLowerCase()}`}>{t.priority}</span></td>
                                                        <td>{t.creator?.name || '-'}</td>
                                                        <td>{t.manager?.name || '-'}</td>
                                                        <td>{t.deadline ? new Date(t.deadline).toLocaleDateString() : '-'}</td>
                                                        <td>
                                                            <button onClick={() => handleDeleteTask(t.id)} className="btn-delete" title="Delete task">
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Send Message Modal for Admins */}
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
