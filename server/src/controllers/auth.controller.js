const db = require('../config/db');
const { hashPassword, comparePassword, generateToken, stripSensitive } = require('../utils/auth');
const { awardPoints, updateStreak } = require('../utils/points');
const { newId } = require('../utils/ids');

async function register(req, res) {
  try {
    const { name, email, password, role, school, grade, section, subject, avatarId, interests, ecoPledge } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'Name, email, password, and role are required' });
    if (!['student','teacher'].includes(role)) return res.status(400).json({ error: 'Role must be student or teacher' });
    if (db.findOne('users', u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await hashPassword(password);
    const user = db.insert('users', {
      id: newId(), name, email, passwordHash, role, school: school || '',
      grade: grade || null, section: section || null, subject: subject || null,
      avatarId: avatarId || 1, interests: interests || [],
      ecoPoints: 0, level: 'Earth Seedling', streakDays: 0,
      lastActiveDate: null, ecoPledge: ecoPledge || '',
      createdAt: new Date().toISOString(),
    });
    // Init points record
    db.insert('points', {
      userId: user.id, totalPoints: 0, level: 'Earth Seedling', earnedBadges: [],
      pointsHistory: [],
      stats: { tasksCompleted: 0, lessonsCompleted: 0, tasksByCategory: {}, quizPerfect: 0, currentStreak: 1, longestStreak: 1, lastActiveDate: new Date().toDateString() }
    });
    const token = generateToken(user.id, user.role);
    res.status(201).json({ user: stripSensitive(user), token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = db.findOne('users', u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const match = await comparePassword(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });
    updateStreak(user.id);
    const token = generateToken(user.id, user.role);
    const fresh = db.findOne('users', u => u.id === user.id);
    res.json({ user: stripSensitive(fresh), token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, me };
