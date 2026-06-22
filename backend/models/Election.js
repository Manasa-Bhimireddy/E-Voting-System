import mongoose from 'mongoose';

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an election title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add an election description'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date/time'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date/time'],
  },
  eligibleVoters: [{
    type: String, // Emails of voters eligible for this election
    lowercase: true,
    trim: true,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

const Election = mongoose.model('Election', electionSchema);
export default Election;
