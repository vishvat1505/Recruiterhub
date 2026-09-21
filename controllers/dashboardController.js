import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import Job from '../models/JobModel.js';
import Application from '../models/ApplicationModel.js';
import Interview from '../models/InterviewModel.js';
import CandidateProfile from '../models/CandidateProfileModel.js';
import { APPLICATION_STAGE_ORDER, JOB_STATUS } from '../utils/constants.js';
import { computeProfileCompletion } from './profileController.js';

// Builds an all-zero stage map then overlays actual counts so every
// stage is always present (Req 9.7 / 10.2)
const buildStageCounts = (rawCounts) => {
  const counts = {};
  APPLICATION_STAGE_ORDER.forEach((stage) => {
    counts[stage] = 0;
  });
  rawCounts.forEach(({ _id, count }) => {
    if (_id in counts) counts[_id] = count;
  });
  return counts;
};

// Recruiter dashboard (Req 9.1 - 9.7)
export const getRecruiterDashboard = async (req, res) => {
  const recruiterId = new mongoose.Types.ObjectId(req.user.userId);

  const [activeJobs, totalApplications, stageAgg, upcomingInterviews] =
    await Promise.all([
      Job.countDocuments({ createdBy: recruiterId, jobStatus: JOB_STATUS.OPEN }),
      Application.countDocuments({ recruiter: recruiterId }),
      Application.aggregate([
        { $match: { recruiter: recruiterId } },
        { $group: { _id: '$stage', count: { $sum: 1 } } },
      ]),
      Interview.find({
        recruiter: recruiterId,
        scheduledAt: { $gt: new Date() },
      })
        .populate({ path: 'job', select: 'company position' })
        .populate({ path: 'candidate', select: 'name email' })
        .sort('scheduledAt')
        .limit(10),
    ]);

  const stageCounts = buildStageCounts(stageAgg);
  // Hiring funnel is the ordered list of stage counts
  const hiringFunnel = APPLICATION_STAGE_ORDER.map((stage) => ({
    stage,
    count: stageCounts[stage],
  }));

  res.status(StatusCodes.OK).json({
    activeJobs,
    totalApplications,
    applicationsByStage: stageCounts,
    upcomingInterviews,
    hiringFunnel,
  });
};

// Candidate dashboard (Req 10.1 - 10.6)
export const getCandidateDashboard = async (req, res) => {
  const candidateId = new mongoose.Types.ObjectId(req.user.userId);

  const [applications, stageAgg, upcomingInterviews, profile] =
    await Promise.all([
      Application.find({ candidate: candidateId })
        .populate({ path: 'job', select: 'company position jobLocation' })
        .sort('-createdAt'),
      Application.aggregate([
        { $match: { candidate: candidateId } },
        { $group: { _id: '$stage', count: { $sum: 1 } } },
      ]),
      Interview.find({
        candidate: candidateId,
        scheduledAt: { $gt: new Date() },
      })
        .populate({ path: 'job', select: 'company position' })
        .sort('scheduledAt'),
      CandidateProfile.findOne({ user: candidateId }),
    ]);

  const appliedJobs = applications.map((app) => ({
    applicationId: app._id,
    job: app.job,
    stage: app.stage,
    appliedAt: app.createdAt,
  }));

  res.status(StatusCodes.OK).json({
    appliedJobs,
    applicationsByStage: buildStageCounts(stageAgg),
    upcomingInterviews,
    profileCompletion: profile ? computeProfileCompletion(profile) : 0,
  });
};
