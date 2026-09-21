import mongoose from 'mongoose';

const CandidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      default: '',
    },
    education: {
      type: String,
      default: '',
    },
    // Resume stored in external object storage (Cloudinary)
    resumeUrl: {
      type: String,
      default: '',
    },
    resumePublicId: {
      type: String,
      default: '',
    },
    portfolioLinks: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model('CandidateProfile', CandidateProfileSchema);
