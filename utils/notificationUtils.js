import Notification from '../models/NotificationModel.js';
import { emitToUser } from './socket.js';

// Creates a persisted notification and emits it in real time.
// Persisting always happens so offline users can retrieve it later
// (Requirement 11.7); the socket emit reaches connected users instantly.
export const notifyUser = async ({
  user,
  type,
  message,
  relatedApplication,
  relatedJob,
}) => {
  const notification = await Notification.create({
    user,
    type,
    message,
    relatedApplication,
    relatedJob,
  });

  emitToUser(user, 'notification', {
    _id: notification._id,
    type: notification.type,
    message: notification.message,
    relatedApplication: notification.relatedApplication,
    relatedJob: notification.relatedJob,
    read: notification.read,
    createdAt: notification.createdAt,
  });

  return notification;
};
