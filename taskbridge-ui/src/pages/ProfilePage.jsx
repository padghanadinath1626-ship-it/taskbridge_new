import { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import './ProfilePage.css';

export const ProfilePage = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        role: '',
        isActive: false,
        joinDate: new Date().toLocaleDateString()
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || 'UNKNOWN',
                isActive: user.active !== undefined ? user.active : true,
                joinDate: new Date(user.createdAt || new Date()).toLocaleDateString()
            });
        }
    }, [user]);

    const getRoleIcon = (role) => {
        const icons = {
            ADMIN: '👨‍💼',
            MANAGER: '👔',
            EMPLOYEE: '👤'
        };
        return icons[role] || '👤';
    };

    const getRoleDescription = (role) => {
        const descriptions = {
            ADMIN: 'System Administrator - Full access and control',
            MANAGER: 'Team Manager - Can manage employees and tasks',
            EMPLOYEE: 'Employee - Can work on assigned tasks'
        };
        return descriptions[role] || 'User';
    };

    const getStatusColor = (isActive) => {
        return isActive ? '#28a745' : '#dc3545';
    };

    const getStatusText = (isActive) => {
        return isActive ? 'Active' : 'Inactive';
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>My Profile</h1>
                <p className="subtitle">View and manage your profile information</p>
            </div>

            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-avatar">
                        <div className="avatar-circle">
                            {getRoleIcon(profileData.role)}
                        </div>
                    </div>

                    <div className="profile-info">
                        <div className="info-section">
                            <h2>{profileData.name}</h2>
                            <p className="role-badge">{profileData.role}</p>
                        </div>

                        <div className="details-grid">
                            <div className="detail-item">
                                <label>Email</label>
                                <p>{profileData.email}</p>
                            </div>

                            <div className="detail-item">
                                <label>Role</label>
                                <p>{profileData.role}</p>
                            </div>

                            <div className="detail-item">
                                <label>Role Description</label>
                                <p>{getRoleDescription(profileData.role)}</p>
                            </div>

                            <div className="detail-item">
                                <label>Status</label>
                                <div 
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '4px',
                                        backgroundColor: getStatusColor(profileData.isActive) + '20',
                                        color: getStatusColor(profileData.isActive),
                                        fontWeight: 'bold'
                                    }}
                                >
                                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getStatusColor(profileData.isActive) }}></span>
                                    {getStatusText(profileData.isActive)}
                                </div>
                            </div>

                            <div className="detail-item">
                                <label>Member Since</label>
                                <p>{profileData.joinDate}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="quick-stats">
                    <h3>Quick Stats</h3>
                    <div className="stats-grid">
                        <div className="stat-box">
                            <div className="stat-icon">📋</div>
                            <div className="stat-info">
                                <p className="stat-label">Role</p>
                                <p className="stat-value">{profileData.role}</p>
                            </div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <p className="stat-label">Account Status</p>
                                <p className="stat-value">{getStatusText(profileData.isActive)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Permissions removed as requested */}

                <div className="contact-info">
                    <h3>Contact Information</h3>
                    <div className="contact-items">
                        <div className="contact-item">
                            <span className="icon">✉️</span>
                            <div>
                                <p className="label">Email</p>
                                <p className="value">{profileData.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
