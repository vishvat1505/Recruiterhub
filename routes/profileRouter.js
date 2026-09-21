import { Router } from 'express';
const router = Router();
import {
  getMyProfile,
  updateProfile,
  uploadResume,
  getCandidateProfileForRecruiter,
} from '../controllers/profileController.js';
import {
  authorizePermissions,
  checkForTestUser,
} from '../middleware/authMiddleware.js';
import { validateProfileInput } from '../middleware/validationMiddleware.js';
import upload from '../middleware/multerMiddleware.js';
import { USER_ROLE } from '../utils/constants.js';

// Candidate-owned profile
router
  .route('/me')
  .get(authorizePermissions(USER_ROLE.CANDIDATE), getMyProfile)
  .patch(
    authorizePermissions(USER_ROLE.CANDIDATE),
    checkForTestUser,
    validateProfileInput,
    updateProfile
  );

router
  .route('/me/resume')
  .post(
    authorizePermissions(USER_ROLE.CANDIDATE),
    checkForTestUser,
    upload.single('resume'),
    uploadResume
  );

// Recruiter views a candidate who applied to one of their jobs
router
  .route('/candidate/:candidateId')
  .get(
    authorizePermissions(USER_ROLE.RECRUITER, USER_ROLE.ADMIN),
    getCandidateProfileForRecruiter
  );

export default router;
