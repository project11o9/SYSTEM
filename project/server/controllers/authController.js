const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { signUserToken } = require('../services/tokenService');

async function register(req, res) {
  try {
    const { username, email, password, phone } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await userModel.createUser({ username, email, passwordHash, phone: phone || null });

    return res.status(201).json({ message: 'User registered successfully', userId });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to register user', error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'User account is disabled' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await userModel.updateLastLogin(user.id);
    const token = signUserToken({ id: user.id, email: user.email, username: user.username });

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        wallet_balance: user.wallet_balance
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login', error: error.message });
  }
}

module.exports = { register, login };
