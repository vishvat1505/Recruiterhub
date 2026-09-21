import * as dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/UserModel.js';
import CandidateProfile from '../models/CandidateProfileModel.js';
import { hashPassword } from '../utils/passwordUtils.js';
import { USER_ROLE } from '../utils/constants.js';

// Creates (or resets the password of) known test accounts so you always
// have a guaranteed recruiter and candidate login. Idempotent.
// Run with: node migrations/seedTestUsers.js
const PASSWORD = 'secret123';

const accounts = [
  {
    name: 'Demo Recruiter',
    lastName: 'RecruitHub',
    email: 'recruiter@test.com',
    location: 'Remote',
    role: USER_ROLE.RECRUITER,
  },
  {
    name: 'Demo Candidate',
    lastName: 'RecruitHub',
    email: 'candidate@test.com',
    location: 'Remote',
    role: USER_ROLE.CANDIDATE,
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('connected, seeding test users...');

  const hashed = await hashPassword(PASSWORD);

  for (const acc of accounts) {
    const user = await User.findOneAndUpdate(
      { email: acc.email },
      { ...acc, password: hashed },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (acc.role === USER_ROLE.CANDIDATE) {
      const existing = await CandidateProfile.findOne({ user: user._id });
      if (!existing) {
        await CandidateProfile.create({
          user: user._id,
          name: user.name,
          email: user.email,
        });
      }
    }
    console.log(`  ✓ ${acc.role.padEnd(10)} ${acc.email}`);
  }

  console.log('\n--- test logins (password for all: ' + PASSWORD + ') ---');
  accounts.forEach((a) => console.log(`  ${a.role}: ${a.email}`));

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error('seed failed:', error);
  process.exit(1);
});
