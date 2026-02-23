import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../auth/AuthService';
import NotificationService from '../api/NotificationService';
import { NotificationsPanel } from './NotificationsPanel';
import './Header.css';

export const Header = () => {
  const navigate = useNavigate();
  const user = AuthService.getUser();
  const isAuthenticated = AuthService.isAuthenticated();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000); // Check every 10s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const unread = await NotificationService.getUnreadNotifications();
      setUnreadCount(Array.isArray(unread) ? unread.length : 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          TaskBridge
        </Link>

        <nav className="nav">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          ) : (
            <>
              {user?.role === 'ADMIN' && (
                <>
                  <Link to="/admin" className="nav-link">Admin Panel</Link>
                  <Link to="/attendance" className="nav-link">Attendance</Link>
                </>
              )}
              {user?.role === 'HR' && (
                <>
                  <Link to="/hr-dashboard" className="nav-link">HR Dashboard</Link>
                </>
              )}
              {user?.role === 'MANAGER' && (
                <>
                  <Link to="/" className="nav-link">Dashboard</Link>
                  <Link to="/attendance" className="nav-link">Attendance</Link>
                </>
              )}
              {user?.role === 'EMPLOYEE' && (
                <>
                  <Link to="/" className="nav-link">My Tasks</Link>
                  <Link to="/calendar" className="nav-link">Calendar</Link>
                </>
              )}
              <Link to="/profile" className="nav-link">Profile</Link>
              <button 
                className="notifications-bell"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
              </button>
              <span className="user-greeting">Hi, {user?.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
      {showNotifications && (
        <NotificationsPanel onClose={() => {
          setShowNotifications(false);
          fetchUnreadCount();
        }} />
      )}
    </header>
  );
};
