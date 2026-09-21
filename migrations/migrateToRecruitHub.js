import 'express-async-errors';
import * as dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/UserModel.js';
import Job from '../models/JobModel.js';
import CandidateProfile from '../models/CandidateProfileModel.js';
import { USER_ROLE } from '../utils/constants.js';

// Idempotent migration from Jobify (roles: user/admin) to RecruitHub
// (roles: candidate/recruiter/admin). Run with: node migrations/migrateToRecruitHub.js
const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('connected to database, starting migration...');

  // 1. Legacy 'user' accounts become recruiters (Req 14.1).
  //    Admins are preserved automatically since we only target 'user' (Req 14.2).
  const userResult = await User.updateMany(
    { role: 'user' },
    { $set: { role: USER_ROLE.RECRUITER } }
  );

  // 2. Jobs keep their existing createdBy ownership (Req 14.3) — no change needed.
  const jobsRetained = await Job.countDocuments();

  // 3. Ensure every candidate has a profile; do not create profiles for
  //    non-candidate accounts (Req 14.4). Idempotent via upsert (Req 14.5).
  const candidates = await User.find({ role: USER_ROLE.CANDIDATE });
  let profilesCreated = 0;
  for (const candidate of candidates) {
    const existing = await CandidateProfile.findOne({ user: candidate._id });
    if (!existing) {
      await CandidateProfile.create({
        user: candidate._id,
        name: candidate.name,
        email: candidate.email,
      });
      profilesCreated += 1;
    }
  }

  // 4. Report (Req 14.6)
  console.log('--- migration summary ---');
  console.log(`accounts migrated to recruiter: ${userResult.modifiedCount}`);
  console.log(`jobs retained: ${jobsRetained}`);
  console.log(`candidate profiles created: ${profilesCreated}`);

  await mongoose.disconnect();
  console.log('migration complete.');
  process.exit(0);
};

run().catch((error) => {
  console.error('migration failed:', error);
  process.exit(1);
});
