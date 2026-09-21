import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import Application from '../models/ApplicationModel.js';
import Interview from '../models/InterviewModel.js';
import Job from '../models/JobModel.js';
import CandidateProfile from '../models/CandidateProfileModel.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/customErrors.js';
import {
  APPLICATION_STAGE,
  NOTIFICATION_TYPE,
  JOB_STATUS,
} from '../utils/constants.js';
import { notifyUser } from '../utils/notificationUtils.js';

// Candidate applies to a job (Req 6.1, 6.2, 6.3)
export const applyToJob = async (req, res) => {
  const { job: jobId, coverLetter } = req.body;

  const job = await Job.findById(jobId);
  if (!job) throw new NotFoundError(`no job with id ${jobId}`);

  // Block applications unless the job is open (closed / on hold are rejected)
  if (job.jobStatus !== JOB_STATUS.OPEN) {
    throw new BadRequestError(
      `this job is ${job.jobStatus} and is not accepting applications`
    );
  }

  const profile = await CandidateProfile.findOne({ user: req.user.userId });
  if (!profile || !profile.resumeUrl)
    throw new BadRequestError('upload a resume before applying');

  const existing = await Application.findOne({
    candidate: req.user.userId,
    job: jobId,
  });
  if (existing) {
    res
      .status(StatusCodes.CONFLICT)
      .json({ msg: 'you have already applied to this job' });
    return;
  }

  const application = await Application.create({
    job: jobId,
    candidate: req.user.userId,
    recruiter: job.createdBy,
    coverLetter: coverLetter || '',
    resumeUrl: profile.resumeUrl,
    stage: APPLICATION_STAGE.APPLIED,
    stageHistory: [
      {
        fromStage: null,
        toStage: APPLICATION_STAGE.APPLIED,
        changedBy: req.user.userId,
      },
    ],
  });

  // Notify the recruiter who owns the job (Req 11.3)
  await notifyUser({
    user: job.createdBy,
    type: NOTIFICATION_TYPE.NEW_APPLICATION,
    message: `New application received for ${job.position}`,
    relatedApplication: application._id,
    relatedJob: job._id,
  });

  res.status(StatusCodes.CREATED).json({ application });
};

// Candidate application history with job details via populate (Req 6.4, 13.6, 13.7)
export const getMyApplications = async (req, res) => {
  const applications = await Application.find({ candidate: req.user.userId })
    .populate({ path: 'job', select: 'company position jobLocation jobType' })
    .sort('-createdAt');

  res
    .status(StatusCodes.OK)
    .json({ totalApplications: applications.length, applications });
};

// Single application — candidate (owner) or owning recruiter (Req 6.6, 7.6)
export const getApplication = async (req, res) => {
  const application = await Application.findById(req.params.id).populate({
    path: 'job',
    select: 'company position jobLocation jobType',
  });
  if (!application) throw new NotFoundError('no application found');

  const isCandidate =
    application.candidate.toString() === req.user.userId;
  const isRecruiter =
    application.recruiter.toString() === req.user.userId;
  if (!isCandidate && !isRecruiter)
    throw new UnauthorizedError('not authorized to access this route');

  res.status(StatusCodes.OK).json({ application });
};

// Candidate withdraws — cascades interview deletion (Req 6.5)
export const withdrawApplication = async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new NotFoundError('no application found');

  if (application.candidate.toString() !== req.user.userId)
    throw new UnauthorizedError('not authorized to access this route');

  await Interview.deleteMany({ application: application._id });
  await application.deleteOne();

  res.status(StatusCodes.OK).json({ msg: 'application withdrawn' });
};

// Recruiter views applicants for one of their jobs (Req 7.5)
export const getJobApplicants = async (req, res) => {
  const { jobId } = req.params;
  const { stage } = req.query;

  const job = await Job.findById(jobId);
  if (!job) throw new NotFoundError(`no job with id ${jobId}`);
  if (job.createdBy.toString() !== req.user.userId)
    throw new UnauthorizedError('not authorized to access this route');

  const queryObject = { job: jobId };
  if (stage && stage !== 'all') queryObject.stage = stage;

  const applicants = await Application.find(queryObject)
    .populate({ path: 'candidate', select: 'name email' })
    .sort('-createdAt');

  res
    .status(StatusCodes.OK)
    .json({ totalApplicants: applicants.length, applicants });
};

// Recruiter moves an applicant through ATS stages (Req 7.2, 7.3, 11.4, 11.6)
export const updateApplicationStage = async (req, res) => {
  const { stage } = req.body;
  const application = await Application.findById(req.params.id);
  if (!application) throw new NotFoundError('no application found');

  if (application.recruiter.toString() !== req.user.userId)
    throw new UnauthorizedError('not authorized to access this route');

  // A recruiter cannot set "hired" directly — a candidate only becomes hired
  // by accepting an offer. Recruiters extend offers; candidates accept.
  if (stage === APPLICATION_STAGE.HIRED)
    throw new BadRequestError(
      'cannot set hired directly; the candidate becomes hired by accepting the offer'
    );

  const previousStage = application.stage;
  application.stage = stage;
  application.stageHistory.push({
    fromStage: previousStage,
    toStage: stage,
    changedBy: req.user.userId,
  });
  await application.save();

  // Status-change notification, escalated for hiring decisions (Req 11.4 / 11.6)
  const isDecision = [
    APPLICATION_STAGE.OFFERED,
    APPLICATION_STAGE.HIRED,
    APPLICATION_STAGE.REJECTED,
  ].includes(stage);

  await notifyUser({
    user: application.candidate,
    type: isDecision
      ? NOTIFICATION_TYPE.HIRING_DECISION
      : NOTIFICATION_TYPE.STATUS_CHANGE,
    message: `Your application status changed to "${stage}"`,
    relatedApplication: application._id,
    relatedJob: application.job,
  });

  res.status(StatusCodes.OK).json({ msg: 'stage updated', application });
};

// Candidate accepts an offer (Option 2: single-acceptance model).
// The accepted application becomes "hired"; all of the candidate's other
// still-active applications are auto-declined ("rejected") and the affected
// recruiters are notified that the candidate accepted elsewhere.
export const acceptOffer = async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new NotFoundError('no application found');

  if (application.candidate.toString() !== req.user.userId)
    throw new UnauthorizedError('not authorized to access this route');

  if (application.stage !== APPLICATION_STAGE.OFFERED)
    throw new BadRequestError('only an offered application can be accepted');

  // 1. Accept this offer -> hired
  const previousStage = application.stage;
  application.stage = APPLICATION_STAGE.HIRED;
  application.stageHistory.push({
    fromStage: previousStage,
    toStage: APPLICATION_STAGE.HIRED,
    changedBy: req.user.userId,
  });
  await application.save();

  // Notify the hiring recruiter
  await notifyUser({
    user: application.recruiter,
    type: NOTIFICATION_TYPE.OFFER_ACCEPTED,
    message: 'The candidate accepted your offer',
    relatedApplication: application._id,
    relatedJob: application.job,
  });

  // 2. Auto-decline ALL of the candidate's other applications that are not
  // already rejected (including any other "hired" ones), so accepting an
  // offer leaves exactly one active/hired application.
  const activeOthers = await Application.find({
    candidate: req.user.userId,
    _id: { $ne: application._id },
    stage: { $ne: APPLICATION_STAGE.REJECTED },
  });

  for (const other of activeOthers) {
    const from = other.stage;
    other.stage = APPLICATION_STAGE.REJECTED;
    other.stageHistory.push({
      fromStage: from,
      toStage: APPLICATION_STAGE.REJECTED,
      changedBy: req.user.userId,
    });
    // Remove any interviews tied to the now-closed application
    await Interview.deleteMany({ application: other._id });
    await other.save();

    await notifyUser({
      user: other.recruiter,
      type: NOTIFICATION_TYPE.OFFER_DECLINED,
      message: 'The candidate accepted another offer and is no longer available',
      relatedApplication: other._id,
      relatedJob: other.job,
    });
  }

  res.status(StatusCodes.OK).json({
    msg: 'offer accepted',
    application,
    autoDeclined: activeOthers.length,
  });
};
