import { Response } from 'express';
import { query, queryOne, run } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

export async function getFees(req: AuthenticatedRequest, res: Response) {
  try {
    const { studentId, status } = req.query;

    let sql = `
      SELECT
        f.*,
        s.full_name as student_name,
        s.student_id as student_roll,
        s.department,
        s.year,
        h.name as hostel_name,
        r.room_number
      FROM fees f
      JOIN students s ON f.student_id = s.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN rooms r ON s.room_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Students only see their own fees
    if (req.user?.role === 'STUDENT') {
      sql += ` AND s.user_id = ?`;
      params.push(req.user.id);
    } else if (studentId) {
      sql += ` AND f.student_id = ?`;
      params.push(studentId);
    }

    if (status) {
      sql += ` AND f.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY f.due_date ASC`;
    const fees = await query(sql, params);

    // Also get payments history for each fee
    const feeIds = fees.map(f => f.id);
    let payments: any[] = [];
    if (feeIds.length > 0) {
      const placeholders = feeIds.map(() => '?').join(',');
      payments = await query(`
        SELECT * FROM payments WHERE fee_id IN (${placeholders}) ORDER BY payment_date DESC
      `, feeIds);
    }

    const paymentsByFeeId: Record<string, any[]> = {};
    for (const p of payments) {
      if (!paymentsByFeeId[p.fee_id]) paymentsByFeeId[p.fee_id] = [];
      paymentsByFeeId[p.fee_id].push(p);
    }

    const enrichedFees = fees.map(f => ({
      ...f,
      payments: paymentsByFeeId[f.id] || []
    }));

    return sendSuccess(res, 'Fees retrieved successfully', enrichedFees);
  } catch (err: any) {
    return sendError(res, 'Failed to fetch fees', err, 500);
  }
}

export async function createFee(req: AuthenticatedRequest, res: Response) {
  try {
    const { studentId, feeType, amount, dueDate } = req.body;

    if (!studentId || !feeType || !amount || !dueDate) {
      return sendError(res, 'Student, fee type, amount, and due date are required', null, 400);
    }

    const parsedAmount = parseFloat(amount);
    const id = `fee_${Date.now()}`;
    const now = new Date().toISOString();

    await run(`
      INSERT INTO fees (id, student_id, fee_type, amount, paid_amount, pending_amount, due_date, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, ?, ?, 'Pending', ?, ?)
    `, [id, studentId, feeType, parsedAmount, parsedAmount, dueDate, now, now]);

    // Send fee reminder notification to student
    const studentUser = await queryOne('SELECT user_id FROM students WHERE id = ?', [studentId]);
    if (studentUser) {
      await run(
        `INSERT INTO notifications (id, user_id, role, title, message, type, link, created_at)
         VALUES (?, ?, 'STUDENT', 'New Fee Invoiced', ?, 'fee', '/student/fees', ?)`,
        [
          `notif_${Date.now()}`,
          studentUser.user_id,
          `${feeType} ($${parsedAmount}) has been invoiced. Due by ${dueDate}.`,
          now
        ]
      );
    }

    return sendSuccess(res, 'Fee invoice created successfully', { id }, 201);
  } catch (err: any) {
    return sendError(res, 'Failed to create fee', err, 500);
  }
}

export async function recordPayment(req: AuthenticatedRequest, res: Response) {
  try {
    const { feeId, amount, paymentMethod, transactionRef } = req.body;

    if (!feeId || !amount) {
      return sendError(res, 'Fee ID and payment amount are required', null, 400);
    }

    const fee = await queryOne('SELECT * FROM fees WHERE id = ?', [feeId]);
    if (!fee) {
      return sendError(res, 'Fee record not found', null, 404);
    }

    const payAmount = parseFloat(amount);
    const newPaid = Number((fee.paid_amount + payAmount).toFixed(2));
    const newPending = Math.max(0, Number((fee.amount - newPaid).toFixed(2)));

    let newStatus = 'Partially Paid';
    if (newPending === 0) newStatus = 'Paid';

    const now = new Date().toISOString();
    const payId = `pay_${Date.now()}`;
    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // 1. Record payment
    await run(`
      INSERT INTO payments (id, fee_id, student_id, amount, payment_date, payment_method, transaction_ref, status, receipt_no, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Completed', ?, ?)
    `, [
      payId,
      feeId,
      fee.student_id,
      payAmount,
      now.split('T')[0],
      paymentMethod || 'Online Transfer',
      transactionRef || `TXN-${Date.now()}`,
      receiptNo,
      now
    ]);

    // 2. Update fee
    await run(`
      UPDATE fees
      SET paid_amount = ?,
          pending_amount = ?,
          status = ?,
          updated_at = ?
      WHERE id = ?
    `, [newPaid, newPending, newStatus, now, feeId]);

    return sendSuccess(res, 'Payment recorded successfully', {
      paymentId: payId,
      receiptNo,
      newStatus,
      paidAmount: newPaid,
      pendingAmount: newPending
    });
  } catch (err: any) {
    return sendError(res, 'Failed to record payment', err, 500);
  }
}
