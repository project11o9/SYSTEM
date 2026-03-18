const pool = require('../config/db');

async function createTransaction({ userId, type, amount, status = 'completed' }) {
  await pool.execute(
    'INSERT INTO transactions (user_id, type, amount, status) VALUES (?, ?, ?, ?)',
    [userId, type, amount, status]
  );
}

async function getByUserId(userId) {
  const [rows] = await pool.execute(
    'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

async function listDeposits() {
  const [rows] = await pool.execute(
    `SELECT t.*, u.username, u.email
     FROM transactions t
     JOIN users u ON t.user_id = u.id
     WHERE t.type = 'credit'
     ORDER BY t.created_at DESC`
  );
  return rows;
}

module.exports = { createTransaction, getByUserId, listDeposits };
