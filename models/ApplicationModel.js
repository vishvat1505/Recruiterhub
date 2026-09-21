import mongoose from 'mongoose';
import { APPLICATION_STAGE } from '../utils/constants.js';

const StageHistorySchema = new mongoose.Schema(
  {
    fromStage: {
      type: String,
      default: null,
    },
    toStage: {
      type: String,
      enum: Object.values(APPLICATION_STAGE),
      required: true,
    },
    changedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true, _id: false }
);

const ApplicationSchema = new mongoose.Schema(
  {
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
    // Denormalized recruiter reference for fast recruiter-scoped queries
    recruiter: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stage: {
      type: String,
      enum: Object.values(APPLICATION_STAGE),
      default: APPLICATION_STAGE.APPLIED,
    },
    coverLetter: {
      type: String,
      default: '',
    },
    // Snapshot of the resume used at apply time
    resumeUrl: {
      type: String,
      default: '',
    },
    stageHistory: {
      type: [StageHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

// One application per candidate per job (Requirement 13.1 / 6.2)
ApplicationSchema.index({ candidate: 1, job: 1 }, { unique: true });
// Stage-filtered queries (Requirement 13.3)
ApplicationSchema.index({ stage: 1 });
// Recruiter-scoped aggregation support
ApplicationSchema.index({ recruiter: 1 });

export default mongoose.model('Application', ApplicationSchema);
