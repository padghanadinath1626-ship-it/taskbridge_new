import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthService } from '../auth/AuthService';

// allowedRoles: optional array of roles like ['ADMIN','MANAGER']
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [inactive, setInactive] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const isAuthenticated = AuthService.isAuthenticated();
      if (!isAuthenticated) {
        if (mounted) {
          setAllowed(false);
          setInactive(false);
          setChecking(false);
        }
        return;
      }

      try {
        const me = await AuthService.getCurrentUser();
        // update stored user info
        localStorage.setItem('user', JSON.stringify(me));
        if (!me.active) {
          // Keep the user logged in but mark as inactive so they can access reactivation page
          if (mounted) {
            setAllowed(false);
            setInactive(true);
          }
        } else {
          if (mounted) setInactive(false);
          // If allowedRoles provided, enforce role check
          if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
            if (allowedRoles.includes(me.role)) {
              if (mounted) setAllowed(true);
            } else {
              if (mounted) setAllowed(false);
            }
          } else {
            if (mounted) setAllowed(true);
          }
        }
      } catch (err) {
        // On error, force logout to clear bad tokens
        AuthService.logout();
        if (mounted) {
          setAllowed(false);
          setInactive(false);
        }
      } finally {
        if (mounted) setChecking(false);
      }
    };
    check();
    return () => { mounted = false; };
    // re-check when location changes
  }, [location.pathname, allowedRoles]);

  if (checking) return null;
  // If user is authenticated but inactive, redirect to reactivation request page
  if (inactive) return <Navigate to="/reactivation-request" replace />;
  if (!allowed) return <Navigate to="/login" replace />;
  return children;
};
