import { Response } from 'express';
import { query, run } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    const notifications = await query(`
      SELECT * FROM notifications
      WHERE user_id = ? OR role = ? OR (user_id IS NULL AND role IS NULL)
      ORDER BY created_at DESC
      LIMIT 25
    `, [userId, role]);

    const unreadCount = notifications.filter(n => n.is_read === 0).length;

    return sendSuccess(res, 'Notifications retrieved', {
      notifications,
      unreadCount
    });
  } catch (err: any) {
    return sendError(res, 'Failed to fetch notifications', err, 500);
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await run('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    return sendSuccess(res, 'Notification marked as read');
  } catch (err: any) {
    return sendError(res, 'Failed to update notification', err, 500);
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    await run('UPDATE notifications SET is_read = 1 WHERE user_id = ? OR role = ?', [userId, role]);
    return sendSuccess(res, 'All notifications marked as read');
  } catch (err: any) {
    return sendError(res, 'Failed to mark notifications as read', err, 500);
  }
}
