import { Router } from 'express';
const router = Router();
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController.js';

router.route('/').get(getMyNotifications);
router.route('/read-all').patch(markAllNotificationsRead);
router.route('/:id/read').patch(markNotificationRead);

export default router;
