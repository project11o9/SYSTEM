const { verifyAdminToken } = require('../services/tokenService');

function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAdminToken(token);
    req.admin = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired admin token' });
  }
}

module.exports = adminAuthMiddleware;
