import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, KeyRound, UserPlus, AlertCircle, Vote } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('voter'); // voter or admin
  const [adminSecretKey, setAdminSecretKey] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      return setError('All fields are required');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (role === 'admin' && !adminSecretKey) {
      return setError('Please enter the Admin validation key');
    }

    setLoading(true);
    const result = await register(name, email, password, role, adminSecretKey);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-ring">
            <Vote size={32} className="logo-icon text-glow" />
          </div>
          <h2>Create Voter Account</h2>
          <p>Register your credentials on the secure ledger</p>
        </div>

        {error && (
          <div className="auth-error-box animate-shake">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="name">Full Legal Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                id="name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                placeholder="jane.doe@voter.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Role selector */}
          <div className="role-selector-container">
            <label>Registration Type</label>
            <div className="role-buttons">
              <button
                type="button"
                className={`role-btn ${role === 'voter' ? 'active' : ''}`}
                onClick={() => setRole('voter')}
                disabled={loading}
              >
                Voter
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
                disabled={loading}
              >
                Administrator
              </button>
            </div>
          </div>

          {/* Admin Validation Code (only if admin role is toggled) */}
          {role === 'admin' && (
            <div className="input-group animate-slide-down">
              <label htmlFor="adminKey">Admin Secret Key</label>
              <div className="input-wrapper">
                <KeyRound className="input-icon" size={18} />
                <input
                  type="password"
                  id="adminKey"
                  placeholder="Enter administrator verification code"
                  value={adminSecretKey}
                  onChange={(e) => setAdminSecretKey(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="btn-spinner"></span>
            ) : (
              <>
                <span>Register Credentials</span>
                <UserPlus size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already registered?{' '}
            <Link to="/login" className="auth-redirect-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
