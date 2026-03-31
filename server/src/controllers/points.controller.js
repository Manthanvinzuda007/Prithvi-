const db = require('../config/db');
const { BADGES, LEVELS } = require('../utils/points');

function getMyPoints(req, res) {
  const points = db.findOne('points', p => p.userId === req.user.id);
  res.json({ points: points || null });
}

function getBadges(req, res) {
  const points = db.findOne('points', p => p.userId === req.user.id);
  const earned = points?.earnedBadges || [];
  const badges = BADGES.map(b => ({ ...b, earned: earned.includes(b.id), earnedAt: null }));
  res.json({ badges });
}

function getHistory(req, res) {
  const { page = 1, limit = 20 } = req.query;
  const points = db.findOne('points', p => p.userId === req.user.id);
  const history = (points?.pointsHistory || []).reverse().slice((page-1)*limit, page*limit);
  res.json({ history, total: points?.pointsHistory?.length || 0 });
}

function getLeaderboard(req, res) {
  const students = db.findAll('users', u => u.role === 'student');
  const ranked = students.map(s => {
    const pts = db.findOne('points', p => p.userId === s.id);
    return { userId: s.id, name: s.name, avatarId: s.avatarId, school: s.school, grade: s.grade, totalPoints: pts?.totalPoints || 0, level: pts?.level || 'Earth Seedling', badgeCount: pts?.earnedBadges?.length || 0 };
  }).sort((a,b) => b.totalPoints - a.totalPoints).map((s,i) => ({ ...s, rank: i+1 }));
  res.json({ leaderboard: ranked });
}

module.exports = { getMyPoints, getBadges, getHistory, getLeaderboard };
