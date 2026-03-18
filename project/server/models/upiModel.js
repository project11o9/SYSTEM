const pool = require('../config/db');

async function upsertUpiDetails(userId, upiId) {
  await pool.execute(
    `INSERT INTO upi_details (user_id, upi_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE upi_id = VALUES(upi_id)`,
    [userId, upiId]
  );
}

async function getByUserId(userId) {
  const [rows] = await pool.execute('SELECT * FROM upi_details WHERE user_id = ?', [userId]);
  return rows[0] || null;
}

async function listAll() {
  const [rows] = await pool.execute(
    `SELECT p.*, u.username, u.email
     FROM upi_details p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.id DESC`
  );
  return rows;
}

module.exports = { upsertUpiDetails, getByUserId, listAll };
