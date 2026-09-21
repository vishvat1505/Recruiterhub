import { body, param, validationResult } from 'express-validator';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/customErrors.js';
import {
  JOB_STATUS,
  JOB_TYPE,
  USER_ROLE,
  APPLICATION_STAGE,
} from '../utils/constants.js';
import mongoose from 'mongoose';
import Job from '../models/JobModel.js';
import User from '../models/UserModel.js';

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);

        if (errorMessages[0].startsWith('no job')) {
          throw new NotFoundError(errorMessages);
        }
        if (errorMessages[0].startsWith('not authorized')) {
          throw new UnauthorizedError('not authorized to access this route');
        }
        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};

export const validateJobInput = withValidationErrors([
  body('company').notEmpty().withMessage('company is required'),
  body('position').notEmpty().withMessage('position is required'),
  body('jobLocation').notEmpty().withMessage('job location is required'),
  body('jobStatus')
    .isIn(Object.values(JOB_STATUS))
    .withMessage('invalid status value'),
  body('jobType')
    .isIn(Object.values(JOB_TYPE))
    .withMessage('invalid type value'),
]);

export const validateIdParam = withValidationErrors([
  param('id').custom(async (value, { req }) => {
    const isValidMongoId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidMongoId) throw new BadRequestError('invalid MongoDB id');
    const job = await Job.findById(value);
    if (!job) throw new NotFoundError(`no job with id ${value}`);
    const isAdmin = req.user.role === USER_ROLE.ADMIN;
    const isOwner = req.user.userId === job.createdBy.toString();

    if (!isAdmin && !isOwner)
      throw new UnauthorizedError('not authorized to access this route');
  }),
]);

export const validateRegisterInput = withValidationErrors([
  body('name').notEmpty().withMessage('name is required'),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format')
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new BadRequestError('email already exists');
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters long'),
  body('location').notEmpty().withMessage('location is required'),
  body('lastName').notEmpty().withMessage('last name is required'),
  // Role is optional; only candidate/recruiter may self-register (Req 1.3)
  body('role')
    .optional()
    .isIn([USER_ROLE.CANDIDATE, USER_ROLE.RECRUITER])
    .withMessage('invalid role selection'),
]);

export const validateLoginInput = withValidationErrors([
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format'),
  body('password').notEmpty().withMessage('password is required'),
]);

export const validateUpdateUserInput = withValidationErrors([
  body('name').notEmpty().withMessage('name is required'),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format')
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });
      if (user && user._id.toString() !== req.user.userId) {
        throw new BadRequestError('email already exists');
      }
    }),

  body('location').notEmpty().withMessage('location is required'),
  body('lastName').notEmpty().withMessage('last name is required'),
]);

// ---------- RecruitHub validators ----------

export const validateProfileInput = withValidationErrors([
  body('name').notEmpty().withMessage('name is required'),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format'),
  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone('any')
    .withMessage('invalid phone number'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('skills must be an array of strings'),
  body('portfolioLinks')
    .optional()
    .isArray()
    .withMessage('portfolio links must be an array of strings'),
  body('portfolioLinks.*')
    .optional()
    .isURL()
    .withMessage('each portfolio link must be a valid URL'),
]);

export const validateApplicationInput = withValidationErrors([
  body('job')
    .notEmpty()
    .withMessage('job id is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value))
        throw new BadRequestError('invalid job id');
      return true;
    }),
  body('coverLetter')
    .optional()
    .isString()
    .withMessage('cover letter must be a string'),
]);

export const validateStageInput = withValidationErrors([
  body('stage')
    .notEmpty()
    .withMessage('stage is required')
    .isIn(Object.values(APPLICATION_STAGE))
    .withMessage('invalid application stage'),
]);

export const validateInterviewInput = withValidationErrors([
  body('application')
    .notEmpty()
    .withMessage('application id is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value))
        throw new BadRequestError('invalid application id');
      return true;
    }),
  body('scheduledAt')
    .notEmpty()
    .withMessage('scheduled date/time is required')
    .isISO8601()
    .withMessage('scheduled date/time must be a valid date')
    .custom((value) => {
      if (new Date(value).getTime() <= Date.now())
        throw new BadRequestError('interview must be scheduled in the future');
      return true;
    }),
  body('interviewerName')
    .notEmpty()
    .withMessage('interviewer name is required'),
]);
