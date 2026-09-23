import { Response } from 'express';
import { query, queryOne, run } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

export async function getExpenses(req: AuthenticatedRequest, res: Response) {
  try {
    const { category, month, hostelId } = req.query;

    let sql = `
      SELECT e.*, h.name as hostel_name
      FROM expenses e
      LEFT JOIN hostels h ON e.hostel_id = h.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      sql += ` AND e.category = ?`;
      params.push(category);
    }
    if (month) {
      sql += ` AND strftime('%Y-%m', e.date) = ?`;
      params.push(month);
    }
    if (hostelId) {
      sql += ` AND e.hostel_id = ?`;
      params.push(hostelId);
    }

    sql += ` ORDER BY e.date DESC`;
    const expenses = await query(sql, params);

    // Aggregations
    const monthlyCategory = await query(`
      SELECT category, SUM(amount) as total
      FROM expenses
      GROUP BY category
      ORDER BY total DESC
    `);

    const monthlyTrend = await query(`
      SELECT strftime('%Y-%m', date) as month, SUM(amount) as total
      FROM expenses
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month ASC
      LIMIT 12
    `);

    return sendSuccess(res, 'Expenses retrieved successfully', {
      expenses,
      byCategory: monthlyCategory,
      monthlyTrend
    });
  } catch (err: any) {
    return sendError(res, 'Failed to fetch expenses', err, 500);
  }
}

export async function createExpense(req: AuthenticatedRequest, res: Response) {
  try {
    const { category, amount, description, date, hostelId, invoiceRef } = req.body;

    if (!category || !amount || !description || !date) {
      return sendError(res, 'Category, amount, description, and date are required', null, 400);
    }

    const expenseCode = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `exp_${Date.now()}`;
    const now = new Date().toISOString();
    const addedBy = req.user?.name || 'Admin';

    await run(`
      INSERT INTO expenses (id, expense_id, category, amount, description, date, hostel_id, added_by, invoice_ref, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, expenseCode, category, parseFloat(amount), description, date, hostelId || 'hostel_01', addedBy, invoiceRef || '', now]);

    return sendSuccess(res, 'Expense created successfully', { id, expenseId: expenseCode }, 201);
  } catch (err: any) {
    return sendError(res, 'Failed to create expense', err, 500);
  }
}

export async function deleteExpense(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await run('DELETE FROM expenses WHERE id = ?', [id]);
    return sendSuccess(res, 'Expense record deleted successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to delete expense', err, 500);
  }
}
