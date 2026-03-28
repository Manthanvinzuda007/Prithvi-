const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function stripSensitive(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

module.exports = { hashPassword, comparePassword, generateToken, verifyToken, stripSensitive };
