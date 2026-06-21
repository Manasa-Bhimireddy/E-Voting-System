import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, Check, ShieldAlert, Award, UserPlus } from 'lucide-react';

export default function AdminPanel() {
  const { authFetch } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [age, setAge] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authFetch('/candidates');
      setCandidates(data);
    } catch (err) {
      setError(err.message || 'Failed to sync candidate repository');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const resetForm = () => {
    setName('');
    setParty('');
    setAge('');
    setIsEditing(false);
    setEditId(null);
  };

  const handleEditClick = (candidate) => {
    setName(candidate.name);
    setParty(candidate.party);
    setAge(candidate.age.toString());
    setIsEditing(true);
    setEditId(candidate._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !party || !age) {
      return setError('Please fill in all candidate parameters');
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 18 || parsedAge > 120) {
      return setError('Nominees must be aged between 18 and 120');
    }

    try {
      if (isEditing) {
        // Edit candidate API call
        const response = await authFetch(`/candidates/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ name, party, age: parsedAge }),
        });
        setSuccess(`Nominee "${name}" updated successfully.`);
      } else {
        // Create candidate API call
        const response = await authFetch('/candidates', {
          method: 'POST',
          body: JSON.stringify({ name, party, age: parsedAge }),
        });
        setSuccess(`Nominee "${name}" registered successfully.`);
      }
      
      resetForm();
      fetchCandidates();
    } catch (err) {
      setError(err.message || 'An error occurred while saving the candidate');
    }
  };

  const handleDeleteClick = async (candidateId, candidateName) => {
    if (
      window.confirm(
        `Are you absolutely sure you want to remove nominee "${candidateName}"? All votes accumulated by this candidate will be permanently deleted.`
      )
    ) {
      try {
        setError('');
        setSuccess('');
        const response = await authFetch(`/candidates/${candidateId}`, {
          method: 'DELETE',
        });
        setSuccess(response.message || `Removed candidate successfully.`);
        fetchCandidates();
      } catch (err) {
        setError(err.message || 'Error occurred while removing candidate');
      }
    }
  };

  return (
    <div className="admin-container animate-fade-in">
      {/* Header alert */}
      <header className="admin-header glass-panel">
        <div className="admin-header-title">
          <ShieldAlert size={28} className="admin-shield" />
          <div>
            <h1>Election Commission Panel</h1>
            <p>Authorized Admin Session - Configure ballot nominees and candidates</p>
          </div>
        </div>
      </header>

      {/* Message alerts */}
      {success && (
        <div className="success-banner animate-slide-down">
          <Check size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="error-banner animate-slide-down">
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-grid">
        {/* Form panel */}
        <section className="admin-form-panel glass-panel">
          <div className="panel-header">
            <h3>{isEditing ? 'Modify Nominee Record' : 'Register New Nominee'}</h3>
            {isEditing && (
              <button onClick={resetForm} className="cancel-edit-btn">
                <X size={16} />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="input-group">
              <label htmlFor="c-name">Nominee Full Name</label>
              <input
                type="text"
                id="c-name"
                placeholder="e.g. Senator Marcus Aurelius"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="c-party">Political Party</label>
              <input
                type="text"
                id="c-party"
                placeholder="e.g. Alliance Blue Party"
                value={party}
                onChange={(e) => setParty(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="c-age">Candidate Age</label>
              <input
                type="number"
                id="c-age"
                placeholder="e.g. 45"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="18"
                max="120"
                required
              />
            </div>

            <button type="submit" className="form-submit-btn">
              {isEditing ? (
                <>
                  <Check size={18} />
                  <span>Update Profile</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Register Nominee</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* List/Table panel */}
        <section className="admin-list-panel glass-panel">
          <div className="panel-header">
            <h3>Enlisted Candidates Directory</h3>
            <span className="count-badge">Count: {candidates.length}</span>
          </div>

          {loading && candidates.length === 0 ? (
            <div className="list-loading">
              <div className="spinner"></div>
              <p>Syncing repository...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="list-empty">
              <UserPlus size={40} className="muted-icon" />
              <p>Nominee ledger is vacant. Create candidate listings using the registration form.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="candidate-table">
                <thead>
                  <tr>
                    <th>Candidate Details</th>
                    <th>Party Affiliation</th>
                    <th>Age</th>
                    <th>Current Votes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate._id}>
                      <td className="font-bold">{candidate.name}</td>
                      <td>
                        <span className="table-party-badge">
                          {candidate.party}
                        </span>
                      </td>
                      <td>{candidate.age} yrs</td>
                      <td className="vote-column">
                        <Award size={14} className="cell-vote-icon" />
                        <span>{candidate.voteCount}</span>
                      </td>
                      <td className="action-column">
                        <button
                          onClick={() => handleEditClick(candidate)}
                          className="table-action-btn edit"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(candidate._id, candidate.name)
                          }
                          className="table-action-btn delete"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
