import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Vote, LayoutDashboard, ShieldAlert, LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <Vote className="logo-icon animate-pulse" />
          <span>VOTECHAIN</span>
        </Link>

        <div className="navbar-links">
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
        </div>

        <div className="navbar-profile">
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
        </div>
      </div>
    </nav>
  );
};
