import Notification from '../models/Notification.js';
import { asyncHandler } from '../middleware/auth.js';
import { isValidObjectId } from '../lib/validate.js';

// GET /api/notifications?unreadOnly=&page=&limit=
export const listNotifications = asyncHandler(async (req, res) => {
  const unreadOnly = req.query.unreadOnly === 'true';
  const lim = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const page = Math.max(1, Number(req.query.page) || 1);
  const filter = { user: req.user._id };
  if (unreadOnly) filter.read = false;
  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * lim).limit(lim),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / lim) || 1, unreadCount });
});

// PATCH /api/notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Notification not found');
  }
  const n = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!n) {
    res.status(404);
    throw new Error('Notification not found');
  }
  n.read = true;
  await n.save();
  res.json(n);
});

// PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
  res.json({ message: 'All notifications marked as read' });
});

// DELETE /api/notifications/:id
export const removeNotification = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Notification not found');
  }
  const n = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!n) {
    res.status(404);
    throw new Error('Notification not found');
  }
  res.json({ message: 'Notification deleted' });
});
