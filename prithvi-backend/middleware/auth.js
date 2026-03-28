const { verifyToken, stripSensitive } = require('../utils/auth');
const db = require('../utils/db');

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    const user = db.findOne('users', u => u.id === decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = stripSensitive(user);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
