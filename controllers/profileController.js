import { StatusCodes } from 'http-status-codes';
import cloudinary from 'cloudinary';
import CandidateProfile from '../models/CandidateProfileModel.js';
import Application from '../models/ApplicationModel.js';
import Job from '../models/JobModel.js';
import { BadRequestError, NotFoundError } from '../errors/customErrors.js';
import { formatPDF } from '../middleware/multerMiddleware.js';
import { PROFILE_REQUIRED_FIELDS } from '../utils/constants.js';

// Computes 0-100 completion based on populated required fields (Req 10.5)
export const computeProfileCompletion = (profile) => {
  const total = PROFILE_REQUIRED_FIELDS.length;
  if (total === 0) return 0;

  const filled = PROFILE_REQUIRED_FIELDS.reduce((count, field) => {
    const value = profile[field];
    const isFilled = Array.isArray(value)
      ? value.length > 0
      : Boolean(value && String(value).trim());
    return count + (isFilled ? 1 : 0);
  }, 0);

  return Math.round((filled / total) * 100);
};

export const getMyProfile = async (req, res) => {
  let profile = await CandidateProfile.findOne({ user: req.user.userId });
  if (!profile) {
    profile = await CandidateProfile.create({ user: req.user.userId });
  }
  res.status(StatusCodes.OK).json({
    profile,
    completion: computeProfileCompletion(profile),
  });
};

export const updateProfile = async (req, res) => {
  const updates = { ...req.body };
  // user reference is immutable
  delete updates.user;

  const profile = await CandidateProfile.findOneAndUpdate(
    { user: req.user.userId },
    updates,
    { new: true, upsert: true, runValidators: true }
  );

  res.status(StatusCodes.OK).json({
    msg: 'profile updated',
    profile,
    completion: computeProfileCompletion(profile),
  });
};

export const uploadResume = async (req, res) => {
  if (!req.file) throw new BadRequestError('no resume file provided');
  if (req.file.mimetype !== 'application/pdf')
    throw new BadRequestError('resume must be a PDF file');

  const file = formatPDF(req.file);
  const response = await cloudinary.v2.uploader.upload(file, {
    resource_type: 'raw',
    folder: 'recruithub/resumes',
  });

  const profile = await CandidateProfile.findOne({ user: req.user.userId });
  if (!profile) throw new NotFoundError('candidate profile not found');

  const previousPublicId = profile.resumePublicId;

  profile.resumeUrl = response.secure_url;
  profile.resumePublicId = response.public_id;
  await profile.save();

  // Delete the previously stored resume (Req 4.4)
  if (previousPublicId) {
    await cloudinary.v2.uploader.destroy(previousPublicId, {
      resource_type: 'raw',
    });
  }

  res.status(StatusCodes.OK).json({
    msg: 'resume uploaded',
    resumeUrl: profile.resumeUrl,
    completion: computeProfileCompletion(profile),
  });
};

// Recruiter views a candidate profile, allowed only if that candidate
// applied to a job the recruiter owns (Req 3.6 / 4.5 / 4.6)
export const getCandidateProfileForRecruiter = async (req, res) => {
  const { candidateId } = req.params;

  const hasApplied = await Application.exists({
    candidate: candidateId,
    recruiter: req.user.userId,
  });
  if (!hasApplied)
    throw new NotFoundError('candidate has not applied to your jobs');

  const profile = await CandidateProfile.findOne({ user: candidateId });
  if (!profile) throw new NotFoundError('candidate profile not found');

  res.status(StatusCodes.OK).json({ profile });
};
