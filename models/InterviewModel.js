import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    job: {
      type: mongoose.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidate: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiter: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    interviewerName: {
      type: String,
      default: '',
    },
    interviewerEmail: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      default: 'video',
    },
    notes: {
      type: String,
      default: '',
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Upcoming-interview queries (Requirement 13.4)
InterviewSchema.index({ scheduledAt: 1 });
InterviewSchema.index({ recruiter: 1 });
InterviewSchema.index({ candidate: 1 });

export default mongoose.model('Interview', InterviewSchema);
