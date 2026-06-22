import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, Check, ShieldAlert, Award, UserPlus, Calendar, Mail, FileText, CheckCircle, Image } from 'lucide-react';

export default function AdminPanel() {
  const { authFetch } = useAuth();
  
  // State for elections
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [loadingElections, setLoadingElections] = useState(true);
  
  // State for candidates
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  
  // General notices
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Election form states
  const [elTitle, setElTitle] = useState('');
  const [elDescription, setElDescription] = useState('');
  const [elStartDate, setElStartDate] = useState('');
  const [elEndDate, setElEndDate] = useState('');
  const [elVoterList, setElVoterList] = useState(''); // line/comma separated emails
  const [showElForm, setShowElForm] = useState(false);

  // Candidate form states
  const [candName, setCandName] = useState('');
  const [candParty, setCandParty] = useState('');
  const [candAge, setCandAge] = useState('');
  const [candPhotoUrl, setCandPhotoUrl] = useState('');
  const [candPartySymbolUrl, setCandPartySymbolUrl] = useState('');
  const [isEditingCand, setIsEditingCand] = useState(false);
  const [editCandId, setEditCandId] = useState(null);

  // Fetch elections list
  const fetchElections = useCallback(async () => {
    try {
      setLoadingElections(true);
      const data = await authFetch('/elections');
      setElections(data);
      
      // Auto-select first election if none selected
      if (data.length > 0 && !selectedElectionId) {
        setSelectedElectionId(data[0]._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to sync elections repository');
    } finally {
      setLoadingElections(false);
    }
  }, [authFetch, selectedElectionId]);

  // Fetch candidates for selected election
  const fetchCandidates = useCallback(async (electionId) => {
    if (!electionId) return;
    try {
      setLoadingCandidates(true);
      const data = await authFetch(`/candidates?electionId=${electionId}`);
      setCandidates(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch candidate repository');
    } finally {
      setLoadingCandidates(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  useEffect(() => {
    if (selectedElectionId) {
      fetchCandidates(selectedElectionId);
    } else {
      setCandidates([]);
    }
  }, [selectedElectionId, fetchCandidates]);

  // Handle Election Submission
  const handleElectionSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!elTitle || !elDescription || !elStartDate || !elEndDate) {
      return setError('Please fill in all election parameters');
    }

    const start = new Date(elStartDate);
    const end = new Date(elEndDate);

    if (start >= end) {
      return setError('Poll start date must occur chronologically before the close date');
    }

    try {
      const response = await authFetch('/elections', {
        method: 'POST',
        body: JSON.stringify({
          title: elTitle,
          description: elDescription,
          startDate: elStartDate,
          endDate: elEndDate,
          eligibleVoters: elVoterList,
        }),
      });

      setSuccess(`Election "${elTitle}" scheduled successfully and voter notifications triggered!`);
      
      // Reset election form
      setElTitle('');
      setElDescription('');
      setElStartDate('');
      setElEndDate('');
      setElVoterList('');
      setShowElForm(false);
      
      // Select the newly created election
      setSelectedElectionId(response._id);
      fetchElections();
    } catch (err) {
      setError(err.message || 'An error occurred while saving the election');
    }
  };

  // Handle Candidate Submission
  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedElectionId) {
      return setError('Please select or create an election first');
    }

    if (!candName || !candParty || !candAge) {
      return setError('Please fill in all nominee fields');
    }

    const parsedAge = parseInt(candAge, 10);
    if (isNaN(parsedAge) || parsedAge < 18 || parsedAge > 120) {
      return setError('Nominees must be aged between 18 and 120');
    }

    try {
      if (isEditingCand) {
        // Update Candidate
        await authFetch(`/candidates/${editCandId}`, {
          method: 'PUT',
          body: JSON.stringify({ 
            name: candName, 
            party: candParty, 
            age: parsedAge,
            photoUrl: candPhotoUrl,
            partySymbolUrl: candPartySymbolUrl,
          }),
        });
        setSuccess(`Nominee "${candName}" updated successfully.`);
      } else {
        // Create Candidate
        await authFetch('/candidates', {
          method: 'POST',
          body: JSON.stringify({
            electionId: selectedElectionId,
            name: candName,
            party: candParty,
            age: parsedAge,
            photoUrl: candPhotoUrl,
            partySymbolUrl: candPartySymbolUrl,
          }),
        });
        setSuccess(`Nominee "${candName}" registered successfully.`);
      }

      // Reset candidate form
      setCandName('');
      setCandParty('');
      setCandAge('');
      setCandPhotoUrl('');
      setCandPartySymbolUrl('');
      setIsEditingCand(false);
      setEditCandId(null);
      
      fetchCandidates(selectedElectionId);
    } catch (err) {
      setError(err.message || 'An error occurred while saving the nominee');
    }
  };

  const handleEditCandClick = (cand) => {
    setCandName(cand.name);
    setCandParty(cand.party);
    setCandAge(cand.age.toString());
    setCandPhotoUrl(cand.photoUrl || '');
    setCandPartySymbolUrl(cand.partySymbolUrl || '');
    setIsEditingCand(true);
    setEditCandId(cand._id);
  };

  const handleCancelCandEdit = () => {
    setCandName('');
    setCandParty('');
    setCandAge('');
    setCandPhotoUrl('');
    setCandPartySymbolUrl('');
    setIsEditingCand(false);
    setEditCandId(null);
  };

  const handleDeleteCandClick = async (candId, name) => {
    if (window.confirm(`Are you sure you want to remove nominee "${name}"? This action is permanent.`)) {
      try {
        setError('');
        setSuccess('');
        const response = await authFetch(`/candidates/${candId}`, {
          method: 'DELETE',
        });
        setSuccess(response.message || 'Nominee removed successfully.');
        fetchCandidates(selectedElectionId);
      } catch (err) {
        setError(err.message || 'Error removing candidate');
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
            <p>Authorized Admin Session - Configure elections, voter lists, and candidates</p>
          </div>
        </div>
      </header>

      {/* Message alerts */}
      {success && (
        <div className="success-banner animate-slide-down">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="error-banner animate-slide-down">
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Admin Action Bar */}
      <div className="admin-actions-bar">
        <div className="election-selector-group">
          <label htmlFor="election-select">Target Election:</label>
          <select
            id="election-select"
            value={selectedElectionId}
            onChange={(e) => {
              setSelectedElectionId(e.target.value);
              handleCancelCandEdit();
              setError('');
              setSuccess('');
            }}
            disabled={loadingElections}
          >
            {elections.map(el => (
              <option key={el._id} value={el._id}>{el.title}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => setShowElForm(!showElForm)} 
          className={`action-btn-primary ${showElForm ? 'active' : ''}`}
        >
          {showElForm ? <X size={18} /> : <Plus size={18} />}
          <span>{showElForm ? 'Close Scheduler' : 'Schedule New Election'}</span>
        </button>
      </div>

      {/* Grid containing forms and panels */}
      <div className="admin-grid">
        {/* Left Side: Create Election Form (Conditional) */}
        {showElForm && (
          <section className="admin-form-panel glass-panel animate-slide-down">
            <div className="panel-header">
              <h3>Create & Schedule Election</h3>
            </div>
            <form onSubmit={handleElectionSubmit} className="admin-form">
              <div className="input-group">
                <label htmlFor="el-title">Election Title</label>
                <input
                  type="text"
                  id="el-title"
                  placeholder="e.g. 2026 Presidential Primaries"
                  value={elTitle}
                  onChange={(e) => setElTitle(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="el-desc">Description</label>
                <textarea
                  id="el-desc"
                  rows="2"
                  placeholder="Describe the scope of this election..."
                  value={elDescription}
                  onChange={(e) => setElDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="el-start">Start Time</label>
                  <input
                    type="datetime-local"
                    id="el-start"
                    value={elStartDate}
                    onChange={(e) => setElStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="el-end">End Time</label>
                  <input
                    type="datetime-local"
                    id="el-end"
                    value={elEndDate}
                    onChange={(e) => setElEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="el-voters">
                  Eligible Voter Email Registry (Separated by comma or newline)
                </label>
                <textarea
                  id="el-voters"
                  rows="4"
                  placeholder="voter1@test.com&#10;voter2@test.com"
                  value={elVoterList}
                  onChange={(e) => setElVoterList(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="form-submit-btn">
                <Calendar size={18} />
                <span>Initialize Polls</span>
              </button>
            </form>
          </section>
        )}

        {/* Form Panel: Nominee Registration */}
        <section className="admin-form-panel glass-panel">
          <div className="panel-header">
            <h3>{isEditingCand ? 'Modify Nominee Record' : 'Register New Nominee'}</h3>
            {isEditingCand && (
              <button onClick={handleCancelCandEdit} className="cancel-edit-btn">
                <X size={16} />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleCandidateSubmit} className="admin-form">
            <div className="input-group">
              <label htmlFor="cand-name">Nominee Full Name</label>
              <input
                type="text"
                id="cand-name"
                placeholder="e.g. Senator Marcus Aurelius"
                value={candName}
                onChange={(e) => setCandName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="cand-party">Political Party</label>
              <input
                type="text"
                id="cand-party"
                placeholder="e.g. Alliance Blue Party"
                value={candParty}
                onChange={(e) => setCandParty(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="cand-age">Candidate Age</label>
              <input
                type="number"
                id="cand-age"
                placeholder="e.g. 45"
                value={candAge}
                onChange={(e) => setCandAge(e.target.value)}
                min="18"
                max="120"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="cand-photo">Candidate Photo URL (Optional)</label>
              <input
                type="text"
                id="cand-photo"
                placeholder="e.g. https://domain.com/photo.jpg"
                value={candPhotoUrl}
                onChange={(e) => setCandPhotoUrl(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="cand-symbol">Party Symbol URL (Optional)</label>
              <input
                type="text"
                id="cand-symbol"
                placeholder="e.g. https://domain.com/symbol.png"
                value={candPartySymbolUrl}
                onChange={(e) => setCandPartySymbolUrl(e.target.value)}
              />
            </div>

            <button type="submit" className="form-submit-btn" disabled={!selectedElectionId}>
              {isEditingCand ? (
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

        {/* Directory Panel: Nominees List */}
        <section className="admin-list-panel glass-panel">
          <div className="panel-header">
            <h3>Enlisted Candidates Directory</h3>
            <span className="count-badge">Count: {candidates.length}</span>
          </div>

          {loadingCandidates && candidates.length === 0 ? (
            <div className="list-loading">
              <div className="spinner"></div>
              <p>Syncing repository...</p>
            </div>
          ) : !selectedElectionId ? (
            <div className="list-empty">
              <ShieldAlert size={40} className="muted-icon" />
              <p>No election target selected. Create or choose an election to review candidates.</p>
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
                    <th>Audited Votes</th>
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
                          onClick={() => handleEditCandClick(candidate)}
                          className="table-action-btn edit"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteCandClick(candidate._id, candidate.name)
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
