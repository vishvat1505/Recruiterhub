import { StatusCodes } from 'http-status-codes';
import Notification from '../models/NotificationModel.js';
import { NotFoundError, UnauthorizedError } from '../errors/customErrors.js';

// Retrieve notifications for the current user, newest first (Req 11.7)
export const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user.userId })
    .sort('-createdAt')
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    user: req.user.userId,
    read: false,
  });

  res.status(StatusCodes.OK).json({ notifications, unreadCount });
};

export const markNotificationRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new NotFoundError('no notification found');

  if (notification.user.toString() !== req.user.userId)
    throw new UnauthorizedError('not authorized to access this route');

  notification.read = true;
  await notification.save();

  res.status(StatusCodes.OK).json({ msg: 'notification marked read' });
};

export const markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user.userId, read: false },
    { read: true }
  );
  res.status(StatusCodes.OK).json({ msg: 'all notifications marked read' });
};
