import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';
import { ProfilePage } from './pages/ProfilePage';
import { AttendanceDashboard } from './pages/AttendanceDashboard';
import { AttendanceCalendar } from './components/AttendanceCalendar';
import { DeactivationRequestPage } from './pages/DeactivationRequestPage';
import { useAuth } from './auth/useAuth';
import './App.css';
import { useEffect } from 'react';
import { AuthService } from './auth/AuthService';

function App() {
  // Heartbeat to detect server-side deactivation (runs every 10s)
  useEffect(() => {
    let cancelled = false;
    const ping = async () => {
      try {
        const me = await AuthService.getCurrentUser();
        if (!me?.active) {
          // If account is deactivated, redirect to request page so user can send reactivation request
          if (window.location.pathname !== '/reactivation-request') {
            window.location.href = '/reactivation-request';
          }
        }
      } catch (err) {
        // ignore network errors; AuthService interceptor will handle unauthorized
      }
    };

    const id = setInterval(() => {
      if (!cancelled && AuthService.isAuthenticated()) ping();
    }, 10000);

    // initial quick check
    if (AuthService.isAuthenticated()) ping();

    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  const { user } = useAuth(); // Need access to user to conditionally render specific links in header if we updated Header. For now just routes.

  return (
    <>
      <Header />
      <div className="main-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={["ADMIN","MANAGER"]}>
                <AttendanceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <div style={{ padding: '2rem' }}>
                  <h1>My Attendance Calendar</h1>
                  <AttendanceCalendar />
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="/reactivation-request" element={<DeactivationRequestPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
