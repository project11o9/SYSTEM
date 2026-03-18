const jwt = require('jsonwebtoken');

const USER_SECRET = process.env.JWT_USER_SECRET;
const ADMIN_SECRET = process.env.JWT_ADMIN_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

function signUserToken(payload) {
  return jwt.sign(payload, USER_SECRET, { expiresIn: EXPIRES_IN });
}

function signAdminToken(payload) {
  return jwt.sign(payload, ADMIN_SECRET, { expiresIn: EXPIRES_IN });
}

function verifyUserToken(token) {
  return jwt.verify(token, USER_SECRET);
}

function verifyAdminToken(token) {
  return jwt.verify(token, ADMIN_SECRET);
}

module.exports = {
  signUserToken,
  signAdminToken,
  verifyUserToken,
  verifyAdminToken
};
