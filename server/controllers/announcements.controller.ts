import { Response } from 'express';
import { query, queryOne, run } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

export async function getAnnouncements(req: AuthenticatedRequest, res: Response) {
  try {
    const { audience, hostelId } = req.query;

    let sql = `
      SELECT a.*, h.name as target_hostel_name
      FROM announcements a
      LEFT JOIN hostels h ON a.target_hostel_id = h.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (req.user?.role === 'STUDENT' && req.user.hostelId) {
      sql += ` AND (a.audience = 'All Students' OR a.target_hostel_id = ?)`;
      params.push(req.user.hostelId);
    } else {
      if (audience) {
        sql += ` AND a.audience = ?`;
        params.push(audience);
      }
      if (hostelId) {
        sql += ` AND a.target_hostel_id = ?`;
        params.push(hostelId);
      }
    }

    sql += ` ORDER BY a.created_at DESC`;
    const announcements = await query(sql, params);

    return sendSuccess(res, 'Announcements retrieved', announcements);
  } catch (err: any) {
    return sendError(res, 'Failed to fetch announcements', err, 500);
  }
}

export async function createAnnouncement(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, description, audience, targetHostelId, priority } = req.body;

    if (!title || !description || !audience) {
      return sendError(res, 'Title, description, and audience are required', null, 400);
    }

    const id = `ann_${Date.now()}`;
    const now = new Date().toISOString();
    const authorName = req.user?.name || 'Hostel Administration';
    const authorRole = req.user?.role === 'ADMIN' ? 'Chief Warden / Admin' : 'Hostel Warden';

    await run(`
      INSERT INTO announcements (id, title, description, audience, target_hostel_id, priority, author_name, author_role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, title, description, audience, targetHostelId || null, priority || 'Medium', authorName, authorRole, now]);

    // Create notifications for students
    await run(`
      INSERT INTO notifications (id, user_id, role, title, message, type, link, created_at)
      VALUES (?, NULL, 'STUDENT', ?, ?, 'announcement', '/student/announcements', ?)
    `, [`notif_${Date.now()}`, `Announcement: ${title}`, description.substring(0, 120) + (description.length > 120 ? '...' : ''), now]);

    return sendSuccess(res, 'Announcement published successfully', { id }, 201);
  } catch (err: any) {
    return sendError(res, 'Failed to publish announcement', err, 500);
  }
}

export async function deleteAnnouncement(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await run('DELETE FROM announcements WHERE id = ?', [id]);
    return sendSuccess(res, 'Announcement deleted successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to delete announcement', err, 500);
  }
}
