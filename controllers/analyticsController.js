import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import day from 'dayjs';
import Job from '../models/JobModel.js';
import User from '../models/UserModel.js';
import Application from '../models/ApplicationModel.js';
import { APPLICATION_STAGE, APPLICATION_STAGE_ORDER } from '../utils/constants.js';

// Recruiter analytics (Req 12.1 - 12.4, 12.6)
export const getRecruiterAnalytics = async (req, res) => {
  const recruiterId = new mongoose.Types.ObjectId(req.user.userId);

  const [monthlyAgg, stageAgg, totalApplications, hiredCount, topJobsAgg] =
    await Promise.all([
      // Applications per month for last 6 months (reuses Jobify pattern)
      Application.aggregate([
        { $match: { recruiter: recruiterId } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
      ]),
      Application.aggregate([
        { $match: { recruiter: recruiterId } },
        { $group: { _id: '$stage', count: { $sum: 1 } } },
      ]),
      Application.countDocuments({ recruiter: recruiterId }),
      Application.countDocuments({
        recruiter: recruiterId,
        stage: APPLICATION_STAGE.HIRED,
      }),
      // Top performing jobs by application count
      Application.aggregate([
        { $match: { recruiter: recruiterId } },
        { $group: { _id: '$job', applications: { $sum: 1 } } },
        { $sort: { applications: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'jobs',
            localField: '_id',
            foreignField: '_id',
            as: 'job',
          },
        },
        { $unwind: '$job' },
        {
          $project: {
            _id: 1,
            applications: 1,
            position: '$job.position',
            company: '$job.company',
          },
        },
      ]),
    ]);

  const monthlyApplications = monthlyAgg
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

  const stageMap = {};
  APPLICATION_STAGE_ORDER.forEach((s) => (stageMap[s] = 0));
  stageAgg.forEach(({ _id, count }) => {
    if (_id in stageMap) stageMap[_id] = count;
  });
  const hiringFunnel = APPLICATION_STAGE_ORDER.map((stage) => ({
    stage,
    count: stageMap[stage],
  }));

  // Conversion rate capped at 100, with zero-denominator flag (Req 12.2, 12.6)
  let conversionRate = 0.0;
  let zeroApplications = false;
  if (totalApplications === 0) {
    zeroApplications = true;
  } else {
    conversionRate = Math.min(
      100,
      Math.round((hiredCount / totalApplications) * 1000) / 10
    );
  }

  res.status(StatusCodes.OK).json({
    monthlyApplications,
    conversionRate,
    zeroApplications,
    hiringFunnel,
    topJobs: topJobsAgg,
  });
};

// Admin platform analytics (Req 12.5, extends Jobify getApplicationStats)
export const getPlatformAnalytics = async (req, res) => {
  const [users, jobs, applications] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
  ]);

  res.status(StatusCodes.OK).json({ users, jobs, applications });
};
