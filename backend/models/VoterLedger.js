import mongoose from 'mongoose';

const voterLedgerSchema = new mongoose.Schema({
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true,
  },
  votedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

// Composite unique index to prevent a voter from voting in the same election twice
voterLedgerSchema.index({ voterId: 1, electionId: 1 }, { unique: true });

const VoterLedger = mongoose.model('VoterLedger', voterLedgerSchema);
export default VoterLedger;
