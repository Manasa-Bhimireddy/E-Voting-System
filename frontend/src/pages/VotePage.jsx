import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CandidateCard } from '../components/CandidateCard';
import { ResultsChart } from '../components/ResultsChart';
import { Landmark, ArrowLeft, ShieldCheck, Lock, Clock, Info, AlertTriangle, Calendar, Award } from 'lucide-react';

export default function VotePage() {
  const { electionId } = useParams();
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchElectionAndCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch details of specific election
      const elData = await authFetch(`/elections/${electionId}`);
      setElection(elData);

      // Fetch candidates associated with election
      const candData = await authFetch(`/candidates?electionId=${electionId}`);
      setCandidates(candData);
    } catch (err) {
      setError(err.message || 'Failed to sync election logs');
    } finally {
      setLoading(false);
    }
  }, [electionId, authFetch]);

  useEffect(() => {
    fetchElectionAndCandidates();
  }, [fetchElectionAndCandidates]);

  const handleVote = async (candidateId) => {
    try {
      setError('');
      setSuccess('');

      await authFetch(`/candidates/vote/${candidateId}`, {
        method: 'POST',
      });

      // Direct redirect back to dashboard on success, passing state
      navigate('/dashboard', { 
        state: { success: `Your ballot has been successfully recorded in the election ledger!` } 
      });
    } catch (err) {
      setError(err.message || 'Error occurred while recording vote');
    }
  };

  const getElectionStatus = (el) => {
    if (!el) return { label: '', class: '' };
    const now = new Date();
    const start = new Date(el.startDate);
    const end = new Date(el.endDate);
    
    if (now < start) return { label: 'Upcoming', class: 'upcoming', icon: Calendar };
    if (now > end) return { label: 'Closed', class: 'closed', icon: Lock };
    return { label: 'Active', class: 'active', icon: Clock };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Synchronizing secure ledger details...</p>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="dashboard-container">
        <button onClick={() => navigate('/dashboard')} className="refresh-btn fit-content mb-4">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
        <div className="error-banner">
          <Info size={20} />
          <span>{error || 'Selected election record could not be resolved.'}</span>
        </div>
      </div>
    );
  }

  const status = getElectionStatus(election);
  const StatusIcon = status.icon;

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Back button */}
      <div className="vote-page-navigation">
        <button onClick={() => navigate('/dashboard')} className="refresh-btn">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Detail Header */}
      <header className="election-detail-header glass-panel">
        <div className="detail-title-row">
          <div className="detail-title-block">
            <Landmark size={24} className="header-icon" />
            <h2>{election.title}</h2>
          </div>
          <span className={`status-tag-large ${status.class}`}>
            <StatusIcon size={14} style={{ marginRight: '6px' }} />
            {status.label}
          </span>
        </div>
        <p className="detail-desc">{election.description}</p>
        
        <div className="detail-dates-row">
          <div className="date-item">
            <span className="date-label">Polls Open</span>
            <span className="date-value">{new Date(election.startDate).toLocaleString()}</span>
          </div>
          <div className="date-item">
            <span className="date-label">Polls Close</span>
            <span className="date-value">{new Date(election.endDate).toLocaleString()}</span>
          </div>
        </div>

        {/* Eligibility warnings */}
        {election.isEligible ? (
          <div className="eligibility-alert-box success-alert">
            <ShieldCheck size={20} className="alert-icon" />
            <div>
              <h5>Voter Registry: Verified Eligible</h5>
              <p>Your credentials are logged in this election's eligibility registry.</p>
            </div>
          </div>
        ) : (
          <div className="eligibility-alert-box danger-alert">
            <AlertTriangle size={20} className="alert-icon" />
            <div>
              <h5>Access Restricted</h5>
              <p>You are not registered as an eligible voter for this election. Ballot submission is locked.</p>
            </div>
          </div>
        )}
      </header>

      {/* Results View - Announce after closed */}
      {(() => {
        if (status.label === 'Closed') {
          return (
            <div className="results-container glass-panel animate-fade-in">
              <ResultsChart candidates={candidates} />
            </div>
          );
        }
        
        if (user.role === 'admin') {
          return (
            <div className="results-container glass-panel animate-fade-in">
              <div className="admin-live-badge">
                <Info size={16} />
                <span>Admin Audit Mode: Live Results View</span>
              </div>
              <ResultsChart candidates={candidates} />
            </div>
          );
        }

        return (
          <div className="results-hidden-alert glass-panel">
            <Lock size={32} className="alert-lock-icon" />
            <h3>Results Time-Locked</h3>
            <p>
              In compliance with ballot integrity guidelines, election results are kept secret while polling is active. 
              Official announcements will compile here once polls close on <strong>{new Date(election.endDate).toLocaleString()}</strong>.
            </p>
          </div>
        );
      })()}

      {/* Ballot and Candidates Panel */}
      <div className="candidates-container">
        <h3>
          {status.label === 'Active' && election.isEligible && !election.hasVoted
            ? 'Cast Your Ballot: Select Candidate'
            : 'Candidate Ledger'}
        </h3>

        {/* Voter has already voted notice */}
        {status.label === 'Active' && election.isEligible && election.hasVoted && (
          <div className="success-banner mb-4">
            <ShieldCheck size={24} className="text-success" />
            <div>
              <h4>Ballot Successfully Processed</h4>
              <p>You have already cast your vote in this election. Double voting is restricted.</p>
            </div>
          </div>
        )}

        {candidates.length === 0 ? (
          <div className="empty-candidates-card glass-panel">
            <Info size={40} className="muted-icon" />
            <h4>No Nominees Enlisted</h4>
            <p>The election commission has not registered candidates for this election.</p>
          </div>
        ) : (
          <div className="candidates-grid">
            {candidates.map((cand) => {
              // Enable vote buttons only if Active, Eligible, User has not voted, and user is voter (not admin)
              const canVote = status.label === 'Active' && 
                              election.isEligible && 
                              !election.hasVoted && 
                              user.role !== 'admin';

              return (
                <CandidateCard
                  key={cand._id}
                  candidate={cand}
                  onVote={handleVote}
                  hasVoted={!canVote}
                  isUserAdmin={user.role === 'admin' || status.label === 'Closed' || status.label === 'Upcoming' || !election.isEligible}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
