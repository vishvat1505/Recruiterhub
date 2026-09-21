import { Router } from 'express';
const router = Router();
import {
  getRecruiterAnalytics,
  getPlatformAnalytics,
} from '../controllers/analyticsController.js';
import { authorizePermissions } from '../middleware/authMiddleware.js';
import { USER_ROLE } from '../utils/constants.js';

router
  .route('/recruiter')
  .get(
    authorizePermissions(USER_ROLE.RECRUITER, USER_ROLE.ADMIN),
    getRecruiterAnalytics
  );

router
  .route('/platform')
  .get(authorizePermissions(USER_ROLE.ADMIN), getPlatformAnalytics);

export default router;
