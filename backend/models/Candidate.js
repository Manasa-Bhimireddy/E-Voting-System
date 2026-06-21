import mongoose from 'mongoose';

const voteLogSchema = new mongoose.Schema({
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  votedAt: {
    type: Date,
    default: Date.now,
  }
}, { _id: false });

const candidateSchema = new mongoose.Schema({
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
