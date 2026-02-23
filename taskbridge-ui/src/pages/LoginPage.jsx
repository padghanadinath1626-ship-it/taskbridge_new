import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { AuthService } from '../auth/AuthService';
import './Auth.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth(); // useAuth handles loading/error state
  const navigate = useNavigate();
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      const user = await login(email, password);
      // After login, fetch current user to check active status and redirect accordingly
      try {
        const me = await AuthService.getCurrentUser();
        if (me && me.active === false) {
          navigate('/reactivation-request');
          return;
        }
      } catch (err) {
        // ignore; fallback to role-based redirect
      }

      // Redirect based on role
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'HR') navigate('/hr-dashboard');
      else if (user.role === 'MANAGER') navigate('/attendance');
      else navigate('/');
    } catch (err) {
      setLocalError('Invalid email or password');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        {error && <div className="error-message">{error}</div>}
        {localError && <div className="error-message">{localError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="auth-btn">Sign In</button>
        </form>

        <div className="auth-redirect">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};
