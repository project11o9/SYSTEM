const bcrypt = require('bcrypt');
const pool = require('../config/db');
const adminModel = require('../models/adminModel');
const userModel = require('../models/userModel');
const bankModel = require('../models/bankModel');
const upiModel = require('../models/upiModel');
const transactionModel = require('../models/transactionModel');
const withdrawModel = require('../models/withdrawModel');
const { signAdminToken } = require('../services/tokenService');

async function adminLogin(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    const admin = await adminModel.findByUsername(username);
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signAdminToken({ id: admin.id, username: admin.username, role: admin.role });

    return res.json({ token, admin: { id: admin.id, username: admin.username, role: admin.role } });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login admin', error: error.message });
  }
}

async function listUsers(req, res) {
  try {
    const users = await userModel.listUsers(req.query.search || '');
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list users', error: error.message });
  }
}

async function injectWallet(req, res) {
  const connection = await pool.getConnection();

  try {
    const userId = Number(req.params.id);
    const amount = Number(req.body.amount);

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid user id and amount are required' });
    }

    await connection.beginTransaction();

    const [users] = await connection.execute('SELECT id FROM users WHERE id = ? FOR UPDATE', [userId]);
    if (!users[0]) {
      await connection.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    await connection.execute('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [amount, userId]);
    await connection.execute(
      'INSERT INTO transactions (user_id, type, amount, status) VALUES (?, "credit", ?, "completed")',
      [userId, amount]
    );

    await connection.commit();
    return res.json({ message: 'Wallet injected successfully' });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: 'Failed to inject wallet', error: error.message });
  } finally {
    connection.release();
  }
}

async function updateUserStatus(req, res) {
  try {
    const userId = Number(req.params.id);
    const { status } = req.body;

    if (!['active', 'banned'].includes(status)) {
      return res.status(400).json({ message: 'status must be active or banned' });
    }

    await userModel.updateStatus(userId, status);
    return res.json({ message: 'User status updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
}

async function listWithdrawals(req, res) {
  try {
    const withdrawals = await withdrawModel.listAll();
    return res.json(withdrawals);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list withdrawals', error: error.message });
  }
}

async function approveWithdraw(req, res) {
  const connection = await pool.getConnection();
  try {
    const requestId = Number(req.params.id);
    await connection.beginTransaction();

    const [requests] = await connection.execute('SELECT * FROM withdraw_requests WHERE id = ? FOR UPDATE', [requestId]);
    const request = requests[0];

    if (!request) {
      await connection.rollback();
      return res.status(404).json({ message: 'Withdraw request not found' });
    }

    if (request.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ message: 'Withdraw request already processed' });
    }

    const [users] = await connection.execute('SELECT wallet_balance FROM users WHERE id = ? FOR UPDATE', [request.user_id]);
    const user = users[0];

    if (!user || Number(user.wallet_balance) < Number(request.amount)) {
      await connection.rollback();
      return res.status(400).json({ message: 'Insufficient user balance for approval' });
    }

    await connection.execute('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?', [request.amount, request.user_id]);
    await connection.execute(
      'UPDATE withdraw_requests SET status = "approved", processed_at = NOW() WHERE id = ?',
      [requestId]
    );
    await connection.execute(
      'UPDATE transactions SET status = "completed" WHERE user_id = ? AND type = "debit" AND amount = ? AND status = "pending" ORDER BY id DESC LIMIT 1',
      [request.user_id, request.amount]
    );

    await connection.commit();
    return res.json({ message: 'Withdraw approved successfully' });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: 'Failed to approve withdraw', error: error.message });
  } finally {
    connection.release();
  }
}

async function rejectWithdraw(req, res) {
  const connection = await pool.getConnection();
  try {
    const requestId = Number(req.params.id);
    await connection.beginTransaction();

    const [requests] = await connection.execute('SELECT * FROM withdraw_requests WHERE id = ? FOR UPDATE', [requestId]);
    const request = requests[0];

    if (!request) {
      await connection.rollback();
      return res.status(404).json({ message: 'Withdraw request not found' });
    }

    if (request.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ message: 'Withdraw request already processed' });
    }

    await connection.execute(
      'UPDATE withdraw_requests SET status = "rejected", processed_at = NOW() WHERE id = ?',
      [requestId]
    );
    await connection.execute(
      'UPDATE transactions SET status = "rejected" WHERE user_id = ? AND type = "debit" AND amount = ? AND status = "pending" ORDER BY id DESC LIMIT 1',
      [request.user_id, request.amount]
    );

    await connection.commit();
    return res.json({ message: 'Withdraw rejected successfully' });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: 'Failed to reject withdraw', error: error.message });
  } finally {
    connection.release();
  }
}

async function listBankDetails(req, res) {
  try {
    const rows = await bankModel.listAll();
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list bank details', error: error.message });
  }
}

async function listUpiDetails(req, res) {
  try {
    const rows = await upiModel.listAll();
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list UPI details', error: error.message });
  }
}

async function listDeposits(req, res) {
  try {
    const rows = await transactionModel.listDeposits();
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list deposits', error: error.message });
  }
}

module.exports = {
  adminLogin,
  listUsers,
  injectWallet,
  updateUserStatus,
  listWithdrawals,
  approveWithdraw,
  rejectWithdraw,
  listBankDetails,
  listUpiDetails,
  listDeposits
};
