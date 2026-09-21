import { Router } from 'express';
const router = Router();
import {
  scheduleInterview,
  updateInterview,
  getUpcomingInterviews,
} from '../controllers/interviewController.js';
import {
  authorizePermissions,
  checkForTestUser,
} from '../middleware/authMiddleware.js';
import { validateInterviewInput } from '../middleware/validationMiddleware.js';
import { USER_ROLE } from '../utils/constants.js';

// Recruiter schedules interviews
router
  .route('/')
  .post(
    authorizePermissions(USER_ROLE.RECRUITER, USER_ROLE.ADMIN),
    checkForTestUser,
    validateInterviewInput,
    scheduleInterview
  );

// Upcoming interviews for the current user (recruiter or candidate)
router.route('/upcoming').get(getUpcomingInterviews);

// Recruiter records notes/feedback or reschedules
router
  .route('/:id')
  .patch(
    authorizePermissions(USER_ROLE.RECRUITER, USER_ROLE.ADMIN),
    checkForTestUser,
    updateInterview
  );

export default router;
