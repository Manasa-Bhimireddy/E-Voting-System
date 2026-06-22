import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Vote, LayoutDashboard, ShieldAlert, LogOut, User, LogIn, UserPlus } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const handleLandingScroll = (elementId) => {
    if (location.pathname !== '/' && location.pathname !== '/home') {
      navigate('/home');
      // Wait for navigation before scrolling
      setTimeout(() => {
        const el = document.getElementById(elementId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(elementId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={user ? "/dashboard" : "/home"} className="navbar-logo">
          <Vote className="logo-icon animate-pulse" />
          <span>VOTECHAIN</span>
        </Link>

        {/* Dynamic Navigation Links based on authentication */}
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-item">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>

              {user.role === 'admin' && (
                <Link to="/admin" className="nav-item admin-link">
                  <ShieldAlert size={18} />
                  <span>Admin Panel</span>
                </Link>
              )}
            </>
          ) : (
            <>
              <button onClick={() => navigate('/home')} className="nav-btn-link nav-item">
                Home
              </button>
              <button onClick={() => handleLandingScroll('features')} className="nav-btn-link nav-item">
                Features
              </button>
              <button onClick={() => handleLandingScroll('faq')} className="nav-btn-link nav-item">
                FAQ
              </button>
              <button onClick={() => handleLandingScroll('contact')} className="nav-btn-link nav-item">
                Contact
              </button>
            </>
          )}
        </div>

        {/* Profile / Authentication Controls */}
        <div className="navbar-profile">
          {user ? (
            <>
              <div className="user-info">
                <User size={16} className="user-icon" />
                <div className="user-details">
                  <span className="user-name">{user.name}</span>
                  <span className={`role-badge ${user.role}`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <button onClick={handleLogout} className="logout-btn" title="Logout">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="auth-nav-buttons">
              <Link to="/login" className="nav-auth-btn signin">
                <LogIn size={16} />
                <span>Sign In</span>
              </Link>
              <Link to="/register" className="nav-auth-btn signup">
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
