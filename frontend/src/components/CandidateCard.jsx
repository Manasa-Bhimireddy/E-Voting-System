import React, { useState } from 'react';
import { UserCheck, Award, HeartHandshake } from 'lucide-react';

const getPartyTheme = (party = '') => {
  const p = party.toLowerCase();
  if (p.includes('democrat') || p.includes('blue') || p.includes('lib')) {
    return { gradient: 'var(--blue-gradient)', accent: '#2563eb', initialsColor: '#3b82f6' };
  }
  if (p.includes('republican') || p.includes('red') || p.includes('con')) {
    return { gradient: 'var(--red-gradient)', accent: '#dc2626', initialsColor: '#ef4444' };
  }
  if (p.includes('green') || p.includes('env')) {
    return { gradient: 'var(--green-gradient)', accent: '#16a34a', initialsColor: '#22c55e' };
  }
  if (p.includes('ind') || p.includes('yellow') || p.includes('gold')) {
    return { gradient: 'var(--gold-gradient)', accent: '#ca8a04', initialsColor: '#eab308' };
  }
  return { gradient: 'var(--purple-gradient)', accent: '#7c3aed', initialsColor: '#a78bfa' };
};

export const CandidateCard = ({ candidate, onVote, hasVoted, isUserAdmin }) => {
  const [votingLocal, setVotingLocal] = useState(false);
  const theme = getPartyTheme(candidate.party);

  const handleVoteClick = async () => {
    if (window.confirm(`Are you sure you want to vote for ${candidate.name} of the ${candidate.party}? This action cannot be undone.`)) {
      setVotingLocal(true);
      await onVote(candidate._id);
      setVotingLocal(false);
    }
  };

  const initials = candidate.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="candidate-card" style={{ '--card-accent': theme.accent }}>
      <div className="candidate-card-header" style={{ background: theme.gradient }}>
        <div className="candidate-avatar">
          {initials}
        </div>
        <div className="candidate-meta">
          <h3>{candidate.name}</h3>
          <span className="candidate-party">{candidate.party}</span>
        </div>
      </div>

      <div className="candidate-card-body">
        <div className="info-row">
          <span className="info-label">Age</span>
          <span className="info-value">{candidate.age} years</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Total Votes</span>
          <div className="vote-badge-container">
            <Award size={16} className="vote-icon" />
            <span className="info-value vote-count">{candidate.voteCount}</span>
          </div>
        </div>
      </div>

      <div className="candidate-card-footer">
        {isUserAdmin ? (
          <div className="admin-view-tag">
            <span>Admin view mode</span>
          </div>
        ) : hasVoted ? (
          <div className="vote-disabled-status">
            <HeartHandshake size={18} />
            <span>Ballot Cast</span>
          </div>
        ) : (
          <button
            onClick={handleVoteClick}
            disabled={votingLocal}
            className="vote-action-btn"
          >
            <UserCheck size={18} />
            <span>{votingLocal ? 'Recording...' : 'Cast Vote'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
