import { Router } from 'express';
const router = Router();
import {
  applyToJob,
  getMyApplications,
  getApplication,
  withdrawApplication,
  getJobApplicants,
  updateApplicationStage,
  acceptOffer,
} from '../controllers/applicationController.js';
import {
  authorizePermissions,
  checkForTestUser,
} from '../middleware/authMiddleware.js';
import {
  validateApplicationInput,
  validateStageInput,
} from '../middleware/validationMiddleware.js';
import { USER_ROLE } from '../utils/constants.js';

// Candidate: apply + list own applications
router
  .route('/')
  .post(
    authorizePermissions(USER_ROLE.CANDIDATE),
    checkForTestUser,
    validateApplicationInput,
    applyToJob
  );

router
  .route('/me')
  .get(authorizePermissions(USER_ROLE.CANDIDATE), getMyApplications);

// Recruiter: applicants for one of their jobs
router
  .route('/job/:jobId')
  .get(
    authorizePermissions(USER_ROLE.RECRUITER, USER_ROLE.ADMIN),
    getJobApplicants
  );

// Recruiter: move applicant through ATS stages
router
  .route('/:id/stage')
  .patch(
    authorizePermissions(USER_ROLE.RECRUITER, USER_ROLE.ADMIN),
    checkForTestUser,
    validateStageInput,
    updateApplicationStage
  );

// Candidate: accept an offered application (auto-declines other active ones)
router
  .route('/:id/accept')
  .patch(
    authorizePermissions(USER_ROLE.CANDIDATE),
    checkForTestUser,
    acceptOffer
  );

// Shared: read single application (candidate owner or owning recruiter)
// Candidate: withdraw own application
router
  .route('/:id')
  .get(getApplication)
  .delete(
    authorizePermissions(USER_ROLE.CANDIDATE),
    checkForTestUser,
    withdrawApplication
  );

export default router;
