import mongoose from 'mongoose';

const voteLogSchema = new mongoose.Schema({
  votedAt: {
    type: Date,
    default: Date.now,
  }
}, { _id: false });

const candidateSchema = new mongoose.Schema({
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a candidate name'],
    trim: true,
  },
  party: {
    type: String,
    required: [true, 'Please add a party name'],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, 'Please add candidate age'],
  },
  photoUrl: {
    type: String,
    default: '',
  },
  partySymbolUrl: {
    type: String,
    default: '',
  },
  voteCount: {
    type: Number,
    default: 0,
  },
  votes: [voteLogSchema]
}, {
  timestamps: true,
});

const Candidate = mongoose.model('Candidate', candidateSchema);
export default Candidate;
