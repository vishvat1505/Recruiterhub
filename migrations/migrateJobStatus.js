import * as dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

// Convert legacy job statuses (pending/interview/declined) to the new
// open/closed/on hold model. Anything not already a valid new status -> open.
const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  const db = mongoose.connection;

  const r = await db
    .collection('jobs')
    .updateMany(
      { jobStatus: { $nin: ['open', 'closed', 'on hold'] } },
      { $set: { jobStatus: 'open' } }
    );

  console.log(`Migrated ${r.modifiedCount} job(s) to "open"`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
