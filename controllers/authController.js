import { StatusCodes } from 'http-status-codes';
import User from '../models/UserModel.js';
import CandidateProfile from '../models/CandidateProfileModel.js';
import { comparePassword, hashPassword } from '../utils/passwordUtils.js';
import { UnauthenticatedError } from '../errors/customErrors.js';
import { createJWT } from '../utils/tokenUtils.js';
import { USER_ROLE } from '../utils/constants.js';

export const register = async (req, res) => {
  const isFirstAccount = (await User.countDocuments()) === 0;

  // First account is always admin (reused Jobify behavior).
  // Otherwise honor candidate/recruiter from input, defaulting to candidate.
  // Self-registering as admin is blocked in validation middleware.
  if (isFirstAccount) {
    req.body.role = USER_ROLE.ADMIN;
  } else if (req.body.role !== USER_ROLE.RECRUITER) {
    req.body.role = USER_ROLE.CANDIDATE;
  }

  const hashedPassword = await hashPassword(req.body.password);
  req.body.password = hashedPassword;

  const user = await User.create(req.body);

  // Bootstrap a candidate profile so candidates can complete it later
  if (user.role === USER_ROLE.CANDIDATE) {
    await CandidateProfile.create({
      user: user._id,
      name: user.name,
      email: user.email,
    });
  }

  res.status(StatusCodes.CREATED).json({ msg: 'user created' });
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  const isValidUser =
    user && (await comparePassword(req.body.password, user.password));

  if (!isValidUser) throw new UnauthenticatedError('invalid credentials');

  const token = createJWT({ userId: user._id, role: user.role });

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged in' });
};

export const logout = (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};
