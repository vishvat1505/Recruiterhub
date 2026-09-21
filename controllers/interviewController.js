import { StatusCodes } from 'http-status-codes';
import Interview from '../models/InterviewModel.js';
import Application from '../models/ApplicationModel.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/customErrors.js';
import {
  APPLICATION_STAGE,
  NOTIFICATION_TYPE,
} from '../utils/constants.js';
import { notifyUser } from '../utils/notificationUtils.js';

// Recruiter schedules an interview (Req 8.1, 8.2, 8.3, 11.5)
export const scheduleInterview = async (req, res) => {
  const {
    application: applicationId,
    scheduledAt,
    interviewerName,
    interviewerEmail,
    mode,
    notes,
  } = req.body;

  const application = await Application.findById(applicationId);
  if (!application) throw new NotFoundError('no application found');

  if (application.recruiter.toString() !== req.user.userId)
    throw new UnauthorizedError('not authorized to access this route');

  const interview = await Interview.create({
    application: application._id,
    job: application.job,
    candidate: application.candidate,
    recruiter: application.recruiter,
    scheduledAt,
    interviewerName,
    interviewerEmail: interviewerEmail || '',
    mode: mode || 'video',
    notes: notes || '',
  });

  // Advance the ATS stage automatically (Req 8.2)
  const previousStage = application.stage;
  application.stage = APPLICATION_STAGE.INTERVIEW_SCHEDULED;
  application.stageHistory.push({
    fromStage: previousStage,
    toStage: APPLICATION_STAGE.INTERVIEW_SCHEDULED,
    changedBy: req.user.userId,
  });
  await application.save();

  // Notify the candidate (Req 11.5)
  await notifyUser({
    user: application.candidate,
    type: NOTIFICATION_TYPE.INTERVIEW_SCHEDULED,
    message: `An interview has been scheduled for ${new Date(
      scheduledAt
    ).toLocaleString()}`,
    relatedApplication: application._id,
    relatedJob: application.job,
  });

  res.status(StatusCodes.CREATED).json({ interview });
};

// Recruiter records notes/feedback (Req 8.4)
export const updateInterview = async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) throw new NotFoundError('no interview found');

  if (interview.recruiter.toString() !== req.user.userId)
    throw new UnauthorizedError('not authorized to access this route');

  const { notes, feedback, scheduledAt, interviewerName, interviewerEmail } =
    req.body;

  if (scheduledAt !== undefined) {
    if (new Date(scheduledAt).getTime() <= Date.now())
      throw new BadRequestError('interview must be scheduled in the future');
    interview.scheduledAt = scheduledAt;
  }
  if (notes !== undefined) interview.notes = notes;
  if (feedback !== undefined) interview.feedback = feedback;
  if (interviewerName !== undefined) interview.interviewerName = interviewerName;
  if (interviewerEmail !== undefined)
    interview.interviewerEmail = interviewerEmail;

  await interview.save();

  res.status(StatusCodes.OK).json({ msg: 'interview updated', interview });
};

// Upcoming interviews, scoped by role (Req 8.5, 8.6)
export const getUpcomingInterviews = async (req, res) => {
  const isRecruiter = req.user.role === 'recruiter';
  const scopeField = isRecruiter ? 'recruiter' : 'candidate';

  const interviews = await Interview.find({
    [scopeField]: req.user.userId,
    scheduledAt: { $gt: new Date() },
  })
    .populate({ path: 'job', select: 'company position' })
    .populate({ path: 'candidate', select: 'name email' })
    .sort('scheduledAt');

  res
    .status(StatusCodes.OK)
    .json({ totalInterviews: interviews.length, interviews });
};
