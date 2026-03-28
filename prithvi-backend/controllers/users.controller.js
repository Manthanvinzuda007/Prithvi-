const db = require('../utils/db');
const { stripSensitive } = require('../utils/auth');

function getProfile(req, res) {
  const user = db.findOne('users', u => u.id === req.user.id);
  const points = db.findOne('points', p => p.userId === req.user.id);
  res.json({ user: stripSensitive(user), points });
}

function updateProfile(req, res) {
  const { name, avatarId, interests, ecoPledge } = req.body;
  db.update('users', u => u.id === req.user.id, () => ({
    ...(name && { name }), ...(avatarId && { avatarId }), ...(interests && { interests }), ...(ecoPledge !== undefined && { ecoPledge })
  }));
  const user = db.findOne('users', u => u.id === req.user.id);
  res.json({ user: stripSensitive(user) });
}

function getStudents(req, res) {
  const teacher = req.user;
  const students = db.findAll('users', u => u.role === 'student' && u.school === teacher.school);
  const withPoints = students.map(s => {
    const { passwordHash, ...safe } = s;
    const points = db.findOne('points', p => p.userId === s.id);
    return { ...safe, totalPoints: points?.totalPoints || 0, badgeCount: points?.earnedBadges?.length || 0 };
  });
  res.json({ students: withPoints });
}

function getLeaderboard(req, res) {
  const { limit = 20 } = req.query;
  const students = db.findAll('users', u => u.role === 'student');
  const ranked = students
    .map(s => {
      const { passwordHash, ...safe } = s;
      const points = db.findOne('points', p => p.userId === s.id);
      return { ...safe, totalPoints: points?.totalPoints || s.ecoPoints || 0, badgeCount: points?.earnedBadges?.length || 0 };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, parseInt(limit))
    .map((s, i) => ({ ...s, rank: i + 1 }));
  res.json({ leaderboard: ranked });
}

function getNotifications(req, res) {
  const notifs = db.findAll('notifications', n => n.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20);
  res.json({ notifications: notifs });
}

function markNotificationsRead(req, res) {
  db.update('notifications', n => n.userId === req.user.id && !n.read, () => ({ read: true }));
  res.json({ message: 'All notifications marked as read' });
}

module.exports = { getProfile, updateProfile, getStudents, getLeaderboard, getNotifications, markNotificationsRead };
