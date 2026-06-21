import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { CandidateCard } from '../components/CandidateCard';
import { ResultsChart } from '../components/ResultsChart';
import { ShieldCheck, Vote, Award, Landmark, RefreshCw, Info } from 'lucide-react';

export default function Dashboard() {
  const { user, authFetch, refreshUserStatus } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await authFetch('/candidates');
      setCandidates(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch candidate directory');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleVote = async (candidateId) => {
    try {
      setError('');
      setSuccessMessage('');
      
      const response = await authFetch(`/candidates/vote/${candidateId}`, {
        method: 'POST',
      });

      setSuccessMessage(response.message || 'Vote cast successfully!');
      
      // Sync local user states and refresh list
      await refreshUserStatus();
      await fetchCandidates();
      
      // Scroll to top to see charts and success banner
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Error occurred while voting');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header Panel */}
      <header className="dashboard-header animate-fade-in">
        <div className="header-brand">
          <Landmark size={28} className="header-icon" />
          <div>
            <h1>National Election Ledger</h1>
            <p className="system-time">
              Current Session: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="eligibility-panel">
          <div className="eligibility-item">
            <span className="label">Voter Status</span>
            <div className="value-container">
              <ShieldCheck size={16} className="status-ok-icon" />
              <span className="value text-success">VERIFIED ELIGIBLE</span>
            </div>
          </div>

          <div className="eligibility-item">
            <span className="label">Ballot Record</span>
            <div className="value-container">
              {user.isVoted ? (
                <>
                  <div className="pulse-dot green"></div>
                  <span className="value text-secured font-bold">BALLOT RECORDED</span>
                </>
              ) : user.role === 'admin' ? (
                <>
                  <div className="pulse-dot gold"></div>
                  <span className="value text-warning">ADMIN VIEW</span>
                </>
              ) : (
                <>
                  <div className="pulse-dot blue"></div>
                  <span className="value text-pending">PENDING SUBMISSION</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Message Banner */}
      {successMessage && (
        <div className="success-banner animate-slide-down">
          <Vote className="success-banner-icon animate-bounce" size={24} />
          <div className="success-banner-text">
            <h4>{successMessage}</h4>
            <p>Your cryptographic receipt has been compiled. Double voting is restricted.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner animate-slide-down">
          <Info size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Results Section - Render Chart if voted or admin */}
        {(user.isVoted || user.role === 'admin') && (
          <section className="results-section glass-panel animate-fade-in">
            {loading ? (
              <div className="spinner-container">
                <div className="spinner"></div>
                <p>Syncing ledger details...</p>
              </div>
            ) : (
              <ResultsChart candidates={candidates} />
            )}
          </section>
        )}

        {/* Voting/Candidate Directory Section */}
        <section className="candidates-section">
          <div className="section-header">
            <h2>
              {user.isVoted 
                ? 'Registered Candidate Directory' 
                : 'Cast Your Ballot: Available Candidates'}
            </h2>
            <button 
              onClick={fetchCandidates} 
              disabled={loading} 
              className="refresh-btn"
              title="Sync Ledger"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Sync Ledger</span>
            </button>
          </div>

          {!user.isVoted && user.role !== 'admin' && (
            <div className="ballot-info-alert glass-panel">
              <Info className="alert-icon" size={20} />
              <div>
                <h5>Secure Casting Notice</h5>
                <p>
                  You are authorized to vote for exactly <strong>one</strong> candidate. Once cast, the action cannot be reverted, and the system results tracker will compile the updated figures immediately.
                </p>
              </div>
            </div>
          )}

          {loading && candidates.length === 0 ? (
            <div className="loading-grid-placeholder">
              <div className="spinner"></div>
              <p>Fetching candidate database...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="empty-candidates-card glass-panel">
              <Landmark size={48} className="muted-icon" />
              <h3>No Candidates Enlisted</h3>
              <p>
                The election commission has not registered any nominees. Admins can register candidates using the Admin Panel.
              </p>
            </div>
          ) : (
            <div className="candidates-grid">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate._id}
                  candidate={candidate}
                  onVote={handleVote}
                  hasVoted={user.isVoted}
                  isUserAdmin={user.role === 'admin'}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
