import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Vote, Landmark, RefreshCw, Calendar, Clock, Lock, Info, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Synchronize state success message if passed from redirect
  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(location.state.success);
      // Clean up router history state to avoid banner persisting on manual refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchElections = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await authFetch('/elections');
      setElections(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch election registry');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  const getElectionStatus = (el) => {
    const now = new Date();
    const start = new Date(el.startDate);
    const end = new Date(el.endDate);
    
    if (now < start) return { label: 'Upcoming', class: 'upcoming', icon: Calendar };
    if (now > end) return { label: 'Closed', class: 'closed', icon: Lock };
    return { label: 'Active', class: 'active', icon: Clock };
  };

  // Group elections by timezone status
  const activeElections = elections.filter(el => getElectionStatus(el).label === 'Active');
  const upcomingElections = elections.filter(el => getElectionStatus(el).label === 'Upcoming');
  const closedElections = elections.filter(el => getElectionStatus(el).label === 'Closed');

  const renderElectionCard = (el) => {
    const status = getElectionStatus(el);
    const StatusIcon = status.icon;

    return (
      <div 
        key={el._id} 
        onClick={() => navigate(`/vote/${el._id}`)}
        className="election-card-item glass-panel animate-fade-in"
      >
        <div className="card-item-header">
          <span className={`status-tag ${status.class}`}>
            <StatusIcon size={12} style={{ marginRight: '4px' }} />
            {status.label}
          </span>
          
          <div className="card-item-meta">
            {el.isEligible ? (
              <span className="eligibility-tag eligible">
                <ShieldCheck size={12} />
                <span>Eligible Voter</span>
              </span>
            ) : (
              <span className="eligibility-tag ineligible">
                <Lock size={12} />
                <span>Not Pre-registered</span>
              </span>
            )}
          </div>
        </div>

        <div className="card-item-body">
          <h3>{el.title}</h3>
          <p>{el.description.length > 100 ? `${el.description.substring(0, 100)}...` : el.description}</p>
        </div>

        <div className="card-item-footer">
          <div className="card-dates">
            <div className="card-date-col">
              <span className="lbl">Open</span>
              <span className="val">{new Date(el.startDate).toLocaleDateString()}</span>
            </div>
            <div className="card-date-col">
              <span className="lbl">Close</span>
              <span className="val">{new Date(el.endDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="card-actions">
            {el.isEligible && (
              el.hasVoted ? (
                <span className="vote-status-badge-inline voted">Ballot Cast</span>
              ) : (
                <span className="vote-status-badge-inline pending">Vote Pending</span>
              )
            )}
            <button className="enter-portal-btn">
              <span>Enter Portal</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Header Panel */}
      <header className="dashboard-header animate-fade-in">
        <div className="header-brand">
          <Landmark size={28} className="header-icon" />
          <div>
            <h1>National Election Registry</h1>
            <p className="system-time">
              Current Session: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <button 
          onClick={fetchElections} 
          disabled={loading} 
          className="refresh-btn"
          title="Sync Ledger"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Sync Ledger</span>
        </button>
      </header>

      {/* Message banners */}
      {successMessage && (
        <div className="success-banner animate-slide-down">
          <ShieldCheck size={24} className="text-success animate-bounce" />
          <div className="success-banner-text">
            <h4>Ballot Submission Confirmed</h4>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner animate-slide-down">
          <Info size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading && elections.length === 0 ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Fetching scheduled election ledger...</p>
        </div>
      ) : elections.length === 0 ? (
        <div className="empty-candidates-card glass-panel">
          <Landmark size={48} className="muted-icon" />
          <h3>No Elections Configured</h3>
          <p>The election commission has not scheduled any upcoming, active, or closed polls.</p>
        </div>
      ) : (
        <div className="elections-grid-sections">
          {/* Active Polls */}
          {activeElections.length > 0 && (
            <section className="election-category-section">
              <div className="category-header">
                <div className="pulse-dot green"></div>
                <h2>Active Elections</h2>
              </div>
              <div className="elections-grid">
                {activeElections.map(renderElectionCard)}
              </div>
            </section>
          )}

          {/* Upcoming Polls */}
          {upcomingElections.length > 0 && (
            <section className="election-category-section">
              <div className="category-header">
                <div className="pulse-dot blue"></div>
                <h2>Upcoming Elections</h2>
              </div>
              <div className="elections-grid">
                {upcomingElections.map(renderElectionCard)}
              </div>
            </section>
          )}

          {/* Closed Polls */}
          {closedElections.length > 0 && (
            <section className="election-category-section">
              <div className="category-header">
                <div className="pulse-dot gold"></div>
                <h2>Closed Elections (Results Announced)</h2>
              </div>
              <div className="elections-grid">
                {closedElections.map(renderElectionCard)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
