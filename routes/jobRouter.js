import { Router } from 'express';
const router = Router();
import {
  getAllJobs,
  getOpenJobs,
  getJob,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  showStats,
} from '../controllers/jobController.js';
import {
  validateJobInput,
  validateIdParam,
} from '../middleware/validationMiddleware.js';
import {
  checkForTestUser,
  authorizePermissions,
} from '../middleware/authMiddleware.js';
import { USER_ROLE } from '../utils/constants.js';

// Candidate-facing browse of active jobs
router.route('/open').get(getOpenJobs);

router
  .route('/')
  .get(getAllJobs)
  .post(
    checkForTestUser,
    authorizePermissions(USER_ROLE.RECRUITER, USER_ROLE.ADMIN),
    validateJobInput,
    createJob
  );

router.route('/stats').get(showStats);

// Status-only update (open / closed / on hold) from the job card
router
  .route('/:id/status')
  .patch(
    checkForTestUser,
    authorizePermissions(USER_ROLE.RECRUITER, USER_ROLE.ADMIN),
    validateIdParam,
    updateJobStatus
  );

router
  .route('/:id')
  .get(validateIdParam, getJob)
  .patch(
    checkForTestUser,
    authorizePermissions(USER_ROLE.RECRUITER, USER_ROLE.ADMIN),
    validateJobInput,
    validateIdParam,
    updateJob
  )
  .delete(
    checkForTestUser,
    authorizePermissions(USER_ROLE.RECRUITER, USER_ROLE.ADMIN),
    validateIdParam,
    deleteJob
  );

export default router;
