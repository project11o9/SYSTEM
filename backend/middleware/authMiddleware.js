const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fidelity-dev-secret';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: token missing'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: invalid token'
    });
  }
}

module.exports = authMiddleware;
