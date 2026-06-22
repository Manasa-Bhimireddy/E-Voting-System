import Candidate from '../models/Candidate.js';
import User from '../models/User.js';
import Election from '../models/Election.js';
import VoterLedger from '../models/VoterLedger.js';

// @desc    Get candidates for an election
// @route   GET /api/candidates
// @access  Private
export const getCandidates = async (req, res) => {
  const { electionId } = req.query;

  try {
    if (!electionId) {
      return res.status(400).json({ message: 'Election ID is required' });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const candidates = await Candidate.find({ electionId }).sort({ name: 1 });

    const now = new Date();
    const isClosed = now > election.endDate;

    // Hiding live results from voters while the election is active
    const sanitizedCandidates = candidates.map(c => {
      // Results are announced ONLY after the election has closed.
      // Admins can see the live count.
      const canSeeResults = req.user.role === 'admin' || isClosed;
      
      return {
        _id: c._id,
        electionId: c.electionId,
        name: c.name,
        party: c.party,
        age: c.age,
        photoUrl: c.photoUrl,
        partySymbolUrl: c.partySymbolUrl,
        voteCount: canSeeResults ? c.voteCount : null,
      };
    });

    res.json(sanitizedCandidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching candidates' });
  }
};

// @desc    Create a candidate bound to an election
// @route   POST /api/candidates
// @access  Private/Admin
export const createCandidate = async (req, res) => {
  const { electionId, name, party, age, photoUrl, partySymbolUrl } = req.body;

  try {
    if (!electionId || !name || !party || !age) {
      return res.status(400).json({ message: 'Please provide all candidate parameters, including Election ID' });
    }

    const electionExists = await Election.findById(electionId);
    if (!electionExists) {
      return res.status(404).json({ message: 'Target election record not found' });
    }

    // Check if candidate already exists under the same name and party for this specific election
    const candidateExists = await Candidate.findOne({ electionId, name, party });
    if (candidateExists) {
      return res.status(400).json({ message: 'Candidate already registered for this party in this election' });
    }

    const candidate = new Candidate({
      electionId,
      name,
      party,
      age,
      photoUrl: photoUrl || '',
      partySymbolUrl: partySymbolUrl || '',
    });

    const createdCandidate = await candidate.save();
    res.status(201).json(createdCandidate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating candidate' });
  }
};

// @desc    Update a candidate
// @route   PUT /api/candidates/:id
// @access  Private/Admin
export const updateCandidate = async (req, res) => {
  const { name, party, age, photoUrl, partySymbolUrl } = req.body;

  try {
    const candidate = await Candidate.findById(req.params.id);

    if (candidate) {
      candidate.name = name || candidate.name;
      candidate.party = party || candidate.party;
      candidate.age = age || candidate.age;
      candidate.photoUrl = photoUrl !== undefined ? photoUrl : candidate.photoUrl;
      candidate.partySymbolUrl = partySymbolUrl !== undefined ? partySymbolUrl : candidate.partySymbolUrl;

      const updatedCandidate = await candidate.save();
      res.json(updatedCandidate);
    } else {
      res.status(404).json({ message: 'Candidate not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating candidate' });
  }
};

// @desc    Delete a candidate
// @route   DELETE /api/candidates/:id
// @access  Private/Admin
export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (candidate) {
      await Candidate.deleteOne({ _id: req.params.id });
      res.json({ message: 'Candidate removed successfully' });
    } else {
      res.status(404).json({ message: 'Candidate not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting candidate' });
  }
};

// @desc    Cast a vote for a candidate in an election
// @route   POST /api/candidates/vote/:id
// @access  Private/Voter
export const castVote = async (req, res) => {
  const candidateId = req.params.id;
  const userId = req.user._id;

  try {
    // 1. Check if candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const electionId = candidate.electionId;

    // 2. Fetch the election and check active dates
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election associated with candidate not found' });
    }

    const now = new Date();
    if (now < election.startDate) {
      return res.status(400).json({ message: 'Voting has not commenced for this election' });
    }
    if (now > election.endDate) {
      return res.status(400).json({ message: 'Voting for this election has closed' });
    }

    // 3. Verify voter role and eligibility list
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Administrators are not permitted to vote' });
    }

    const isEligible = election.eligibleVoters.includes(req.user.email.toLowerCase());
    if (!isEligible) {
      return res.status(403).json({ message: 'You are not listed as an eligible voter for this election' });
    }

    // 4. Double-Voting Guard: Register user's vote in VoterLedger first
    let ledgerEntry;
    try {
      ledgerEntry = await VoterLedger.create({ voterId: userId, electionId });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: 'You have already cast your vote in this election' });
      }
      throw err;
    }

    // 5. Cast the vote: Increment candidate voteCount and append anonymous log
    try {
      candidate.votes.push({ votedAt: now });
      candidate.voteCount = candidate.voteCount + 1;
      await candidate.save();
    } catch (saveError) {
      // Rollback ledger entry if candidate save fails
      await VoterLedger.deleteOne({ _id: ledgerEntry._id });
      throw saveError;
    }

    res.json({ message: 'Vote successfully recorded' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error casting vote' });
  }
};
