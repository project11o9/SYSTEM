const pool = require('../config/db');

async function createUser({ username, email, passwordHash, phone }) {
  const [result] = await pool.execute(
    `INSERT INTO users (username, email, password_hash, phone, status, wallet_balance)
     VALUES (?, ?, ?, ?, 'active', 0)`,
    [username, email, passwordHash, phone]
  );
  return result.insertId;
}

async function findByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

async function updateLastLogin(id) {
  await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
}

async function updateProfile(id, { username, phone }) {
  await pool.execute('UPDATE users SET username = ?, phone = ? WHERE id = ?', [username, phone, id]);
}

async function updateStatus(id, status) {
  await pool.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
}

async function addWalletAmount(id, amount) {
  await pool.execute('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [amount, id]);
}

async function subtractWalletAmount(id, amount) {
  await pool.execute('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ? AND wallet_balance >= ?', [amount, id, amount]);
}

async function listUsers(search = '') {
  const query = `%${search}%`;
  const [rows] = await pool.execute(
    `SELECT id, username, email, phone, status, wallet_balance, created_at, last_login,
      CASE WHEN last_login IS NOT NULL AND last_login >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        THEN 'online' ELSE 'offline' END AS online_status
     FROM users
     WHERE username LIKE ? OR email LIKE ?
     ORDER BY created_at DESC`,
    [query, query]
  );
  return rows;
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  updateLastLogin,
  updateProfile,
  updateStatus,
  addWalletAmount,
  subtractWalletAmount,
  listUsers
};
