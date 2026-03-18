const pool = require('../config/db');
const userModel = require('../models/userModel');
const bankModel = require('../models/bankModel');
const upiModel = require('../models/upiModel');
const transactionModel = require('../models/transactionModel');
const withdrawModel = require('../models/withdrawModel');

const MIN_WITHDRAW_LIMIT = Number(process.env.MIN_WITHDRAW_LIMIT || 100);

async function getProfile(req, res) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const bank = await bankModel.getByUserId(req.user.id);
    const upi = await upiModel.getByUserId(req.user.id);

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      status: user.status,
      wallet_balance: user.wallet_balance,
      bank,
      upi
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { username, phone } = req.body;
    if (!username) return res.status(400).json({ message: 'username is required' });

    await userModel.updateProfile(req.user.id, { username, phone: phone || null });
    return res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
}

async function saveBank(req, res) {
  try {
    const { bank_name: bankName, account_number: accountNumber, ifsc } = req.body;
    if (!bankName || !accountNumber || !ifsc) {
      return res.status(400).json({ message: 'bank_name, account_number, and ifsc are required' });
    }

    await bankModel.upsertBankDetails(req.user.id, { bankName, accountNumber, ifsc });
    return res.json({ message: 'Bank details saved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save bank details', error: error.message });
  }
}

async function saveUpi(req, res) {
  try {
    const { upi_id: upiId } = req.body;
    if (!upiId) return res.status(400).json({ message: 'upi_id is required' });

    await upiModel.upsertUpiDetails(req.user.id, upiId);
    return res.json({ message: 'UPI details saved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save UPI details', error: error.message });
  }
}

async function submitWithdraw(req, res) {
  const connection = await pool.getConnection();

  try {
    const { amount } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    if (numericAmount < MIN_WITHDRAW_LIMIT) {
      return res.status(400).json({ message: `Minimum withdraw amount is ${MIN_WITHDRAW_LIMIT}` });
    }

    await connection.beginTransaction();

    const [rows] = await connection.execute('SELECT wallet_balance FROM users WHERE id = ? FOR UPDATE', [req.user.id]);
    const user = rows[0];

    if (!user) {
      await connection.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    if (Number(user.wallet_balance) < numericAmount) {
      await connection.rollback();
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    const [result] = await connection.execute(
      'INSERT INTO withdraw_requests (user_id, amount, status, requested_at) VALUES (?, ?, "pending", NOW())',
      [req.user.id, numericAmount]
    );

    await connection.execute(
      'INSERT INTO transactions (user_id, type, amount, status) VALUES (?, "debit", ?, "pending")',
      [req.user.id, numericAmount]
    );

    await connection.commit();

    return res.status(201).json({ message: 'Withdraw request submitted', request_id: result.insertId });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: 'Failed to submit withdraw request', error: error.message });
  } finally {
    connection.release();
  }
}

async function transactionHistory(req, res) {
  try {
    const transactions = await transactionModel.getByUserId(req.user.id);
    const withdrawals = await withdrawModel.listByUserId(req.user.id);
    return res.json({ transactions, withdrawals });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch history', error: error.message });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  saveBank,
  saveUpi,
  submitWithdraw,
  transactionHistory
};
