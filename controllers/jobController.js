import Job from '../models/JobModel.js';
import Application from '../models/ApplicationModel.js';
import Interview from '../models/InterviewModel.js';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import day from 'dayjs';
import { JOB_STATUS } from '../utils/constants.js';
import { BadRequestError } from '../errors/customErrors.js';

// Recruiter's own jobs (reused Jobify getAllJobs, scoped to owner)
export const getAllJobs = async (req, res) => {
  const { search, jobStatus, jobType, sort } = req.query;

  const queryObject = {
    createdBy: req.user.userId,
  };

  if (search) {
    queryObject.$or = [
      { position: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  if (jobStatus && jobStatus !== 'all') {
    queryObject.jobStatus = jobStatus;
  }
  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType;
  }

  const sortOptions = {
    newest: '-createdAt',
    oldest: 'createdAt',
    'a-z': 'position',
    'z-a': '-position',
  };

  const sortKey = sortOptions[sort] || sortOptions.newest;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const jobs = await Job.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  // Attach the applicant count for each job (single grouped aggregation)
  const jobIds = jobs.map((j) => j._id);
  const counts = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: '$job', count: { $sum: 1 } } },
  ]);
  const countMap = counts.reduce((acc, c) => {
    acc[c._id.toString()] = c.count;
    return acc;
  }, {});
  const jobsWithCounts = jobs.map((job) => ({
    ...job.toObject(),
    applicantCount: countMap[job._id.toString()] || 0,
  }));

  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);
  res
    .status(StatusCodes.OK)
    .json({ totalJobs, numOfPages, currentPage: page, jobs: jobsWithCounts });
};

// Public/candidate-facing browse of active jobs (Req 5.3)
export const getOpenJobs = async (req, res) => {
  const { search, jobType, sort } = req.query;

  // Candidates only see jobs that are open for applications
  const queryObject = { jobStatus: JOB_STATUS.OPEN };

  if (search) {
    queryObject.$or = [
      { position: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }
  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType;
  }

  const sortOptions = {
    newest: '-createdAt',
    oldest: 'createdAt',
    'a-z': 'position',
    'z-a': '-position',
  };
  const sortKey = sortOptions[sort] || sortOptions.newest;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const jobs = await Job.find(queryObject)
    .populate({ path: 'createdBy', select: 'name' })
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);
  res
    .status(StatusCodes.OK)
    .json({ totalJobs, numOfPages, currentPage: page, jobs });
};

export const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

export const getJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  res.status(StatusCodes.OK).json({ job });
};

export const updateJob = async (req, res) => {
  const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(StatusCodes.OK).json({ msg: 'job modified', job: updatedJob });
};

// Delete job and cascade to applications + interviews (Req 5.5, 5.6).
// Uses a transaction for atomic rollback when the deployment supports it
// (replica set / mongos), and falls back to sequential deletes on a
// standalone server so it remains runnable in local development.
export const deleteJob = async (req, res) => {
  const jobId = req.params.id;

  const session = await mongoose.startSession();
  try {
    let removedJob;
    await session.withTransaction(async () => {
      await Interview.deleteMany({ job: jobId }, { session });
      await Application.deleteMany({ job: jobId }, { session });
      removedJob = await Job.findByIdAndDelete(jobId, { session });
    });
    await session.endSession();
    return res
      .status(StatusCodes.OK)
      .json({ msg: 'job deleted', job: removedJob });
  } catch (error) {
    await session.endSession();
    // Transactions unsupported on standalone MongoDB -> sequential fallback
    const standaloneError =
      error?.code === 20 ||
      /Transaction numbers|replica set|mongos/i.test(error?.message || '');
    if (!standaloneError) throw error;

    await Interview.deleteMany({ job: jobId });
    await Application.deleteMany({ job: jobId });
    const removedJob = await Job.findByIdAndDelete(jobId);
    return res
      .status(StatusCodes.OK)
      .json({ msg: 'job deleted', job: removedJob });
  }
};

export const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: '$jobStatus', count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;

      const date = day()
        .month(month - 1)
        .year(year)
        .format('MMM YY');

      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

// Lightweight status-only update so recruiters can flip a job between
// open / closed / on hold directly from the job card (Req 5: ownership
// enforced by validateIdParam in the route).
export const updateJobStatus = async (req, res) => {
  const { jobStatus } = req.body;
  if (!Object.values(JOB_STATUS).includes(jobStatus))
    throw new BadRequestError('invalid job status');

  const updatedJob = await Job.findByIdAndUpdate(
    req.params.id,
    { jobStatus },
    { new: true }
  );

  res.status(StatusCodes.OK).json({ msg: 'status updated', job: updatedJob });
};
