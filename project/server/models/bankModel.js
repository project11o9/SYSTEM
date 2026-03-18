const pool = require('../config/db');

async function upsertBankDetails(userId, { bankName, accountNumber, ifsc }) {
  await pool.execute(
    `INSERT INTO bank_details (user_id, bank_name, account_number, ifsc)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name), account_number = VALUES(account_number), ifsc = VALUES(ifsc)`,
    [userId, bankName, accountNumber, ifsc]
  );
}

async function getByUserId(userId) {
  const [rows] = await pool.execute('SELECT * FROM bank_details WHERE user_id = ?', [userId]);
  return rows[0] || null;
}

async function listAll() {
  const [rows] = await pool.execute(
    `SELECT b.*, u.username, u.email
     FROM bank_details b
     JOIN users u ON b.user_id = u.id
     ORDER BY b.id DESC`
  );
  return rows;
}

module.exports = { upsertBankDetails, getByUserId, listAll };
