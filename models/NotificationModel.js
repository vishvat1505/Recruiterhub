import mongoose from 'mongoose';
import { NOTIFICATION_TYPE } from '../utils/constants.js';

const NotificationSchema = new mongoose.Schema(
  {
    // Recipient of the notification
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Optional related entity references for client-side linking
    relatedApplication: {
      type: mongoose.Types.ObjectId,
      ref: 'Application',
    },
    relatedJob: {
      type: mongoose.Types.ObjectId,
      ref: 'Job',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, read: 1 });

export default mongoose.model('Notification', NotificationSchema);
