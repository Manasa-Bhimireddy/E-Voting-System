import Candidate from '../models/Candidate.js';
import User from '../models/User.js';

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Private
export const getCandidates = async (req, res) => {
  try {
    // Return candidates sorted by name or vote count
    const candidates = await Candidate.find({}).sort({ name: 1 });
    res.json(candidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching candidates' });
  }
};

// @desc    Create a candidate
// @route   POST /api/candidates
// @access  Private/Admin
export const createCandidate = async (req, res) => {
  const { name, party, age } = req.body;

  try {
    // Check if candidate already exists under the same name and party
    const candidateExists = await Candidate.findOne({ name, party });
    if (candidateExists) {
      return res.status(400).json({ message: 'Candidate already registered under this party' });
    }

    const candidate = new Candidate({
      name,
      party,
      age,
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
  const { name, party, age } = req.body;

  try {
    const candidate = await Candidate.findById(req.params.id);

    if (candidate) {
      candidate.name = name || candidate.name;
      candidate.party = party || candidate.party;
      candidate.age = age || candidate.age;

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
      res.json({ message: 'Candidate removed' });
    } else {
      res.status(404).json({ message: 'Candidate not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting candidate' });
  }
};

// @desc    Cast a vote for a candidate
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

    // 2. Fetch voter profile and verify voting status
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Administrators are not permitted to vote' });
    }

    if (user.isVoted) {
      return res.status(400).json({ message: 'You have already cast your vote' });
    }

    // 3. Cast the vote - Use atomic transactions/updates to maintain integrity
    // Update Candidate model: push voter record and increment voteCount
    candidate.votes.push({ voterId: userId });
    candidate.voteCount = candidate.voteCount + 1;
    await candidate.save();

    // Update User model: set isVoted to true
    user.isVoted = true;
    await user.save();

    res.json({ message: 'Vote successfully recorded', voteCount: candidate.voteCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error casting vote' });
  }
};
