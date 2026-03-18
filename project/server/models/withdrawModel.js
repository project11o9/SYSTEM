const pool = require('../config/db');

async function createWithdrawRequest(userId, amount) {
  const [result] = await pool.execute(
    'INSERT INTO withdraw_requests (user_id, amount, status, requested_at) VALUES (?, ?, "pending", NOW())',
    [userId, amount]
  );
  return result.insertId;
}

async function getById(id) {
  const [rows] = await pool.execute('SELECT * FROM withdraw_requests WHERE id = ?', [id]);
  return rows[0] || null;
}

async function listByUserId(userId) {
  const [rows] = await pool.execute(
    'SELECT * FROM withdraw_requests WHERE user_id = ? ORDER BY requested_at DESC',
    [userId]
  );
  return rows;
}

async function listAll() {
  const [rows] = await pool.execute(
    `SELECT w.*, u.username, u.email
     FROM withdraw_requests w
     JOIN users u ON w.user_id = u.id
     ORDER BY w.requested_at DESC`
  );
  return rows;
}

async function updateStatus(id, status) {
  await pool.execute(
    'UPDATE withdraw_requests SET status = ?, processed_at = NOW() WHERE id = ?',
    [status, id]
  );
}

module.exports = { createWithdrawRequest, getById, listByUserId, listAll, updateStatus };
