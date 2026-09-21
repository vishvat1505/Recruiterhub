import { Router } from 'express';
const router = Router();
import {
  getRecruiterDashboard,
  getCandidateDashboard,
} from '../controllers/dashboardController.js';
import { authorizePermissions } from '../middleware/authMiddleware.js';
import { USER_ROLE } from '../utils/constants.js';

router
  .route('/recruiter')
  .get(
    authorizePermissions(USER_ROLE.RECRUITER, USER_ROLE.ADMIN),
    getRecruiterDashboard
  );

router
  .route('/candidate')
  .get(authorizePermissions(USER_ROLE.CANDIDATE), getCandidateDashboard);

export default router;
