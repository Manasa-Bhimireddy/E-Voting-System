import Election from '../models/Election.js';
import VoterLedger from '../models/VoterLedger.js';
import { sendEmail } from '../utils/sendEmail.js';

// @desc    Create a new election
// @route   POST /api/elections
// @access  Private/Admin
export const createElection = async (req, res) => {
  const { title, description, startDate, endDate, eligibleVoters } = req.body;

  try {
    if (!title || !description || !startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide all required election parameters' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid start or end date format' });
    }

    if (start >= end) {
      return res.status(400).json({ message: 'Start date must be chronologically before the end date' });
    }

    // Parse eligible voters (convert list or comma-separated string to array of emails)
    let votersList = [];
    if (Array.isArray(eligibleVoters)) {
      votersList = eligibleVoters;
    } else if (typeof eligibleVoters === 'string') {
      votersList = eligibleVoters
        .split(/[\n,]+/)
        .map(e => e.trim().toLowerCase())
        .filter(e => e.length > 0);
    }

    const election = new Election({
      title,
      description,
      startDate: start,
      endDate: end,
      eligibleVoters: votersList,
      createdBy: req.user._id,
    });

    const createdElection = await election.save();

    // Trigger asynchronous email notifications to eligible voters in the background
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    votersList.forEach(email => {
      sendEmail({
        to: email,
        subject: `🗳️ VoteChain Notification: New Election Scheduled - ${title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #6366f1; text-align: center;">VoteChain Secure Portal</h2>
            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;"/>
            <p>Hello,</p>
            <p>You have been pre-registered and verified as an eligible voter for the upcoming election: <strong>"${title}"</strong>.</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #6366f1;">
              <p style="margin: 5px 0;"><strong>Description:</strong> ${description}</p>
              <p style="margin: 5px 0;"><strong>Polls Open:</strong> ${start.toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Polls Close:</strong> ${end.toLocaleString()}</p>
            </div>

            <p>Please register or sign in to your voter account using your email address, create your secure password, and cast your ballot once the polls are active.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${clientUrl}/login" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access Dashboard</a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;"/>
            <p style="font-size: 11px; color: #7f8c8d; text-align: center;">This is an automated election notification from VoteChain. Please do not reply directly to this mail.</p>
          </div>
        `
      }).catch(err => console.error(`Error sending email to ${email}:`, err));
    });

    res.status(201).json(createdElection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating election record' });
  }
};

// @desc    Get all elections
// @route   GET /api/elections
// @access  Private
export const getElections = async (req, res) => {
  try {
    const elections = await Election.find({}).sort({ startDate: -1 });
    
    // Enrich elections list with the current user's eligibility and voting status
    const enrichedElections = await Promise.all(
      elections.map(async (election) => {
        const isEligible = election.eligibleVoters.includes(req.user.email.toLowerCase()) || req.user.role === 'admin';
        const hasVotedRecord = await VoterLedger.findOne({ voterId: req.user._id, electionId: election._id });
        
        return {
          _id: election._id,
          title: election.title,
          description: election.description,
          startDate: election.startDate,
          endDate: election.endDate,
          isEligible,
          hasVoted: !!hasVotedRecord,
          eligibleCount: election.eligibleVoters.length,
        };
      })
    );

    res.json(enrichedElections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching elections list' });
  }
};

// @desc    Get single election details
// @route   GET /api/elections/:id
// @access  Private
export const getElectionDetails = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const isEligible = election.eligibleVoters.includes(req.user.email.toLowerCase()) || req.user.role === 'admin';
    const hasVotedRecord = await VoterLedger.findOne({ voterId: req.user._id, electionId: election._id });

    res.json({
      _id: election._id,
      title: election.title,
      description: election.description,
      startDate: election.startDate,
      endDate: election.endDate,
      isEligible,
      hasVoted: !!hasVotedRecord,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving election details' });
  }
};
