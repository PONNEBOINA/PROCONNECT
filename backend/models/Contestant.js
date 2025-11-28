import mongoose from 'mongoose';

const contestantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  weekNumber: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'removed', 'winner', 'participant'],
    default: 'active'
  },
  certificateType: {
    type: String,
    enum: ['winner', 'participant', 'none'],
    default: 'none'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations for same week
contestantSchema.index({ project: 1, weekNumber: 1, year: 1 }, { unique: true });

export default mongoose.model('Contestant', contestantSchema);
