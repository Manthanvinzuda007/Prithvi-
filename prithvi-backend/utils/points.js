const db = require('./db');

const LEVELS = [
  { name: 'Earth Seedling',   threshold: 0,    icon: '🌱' },
  { name: 'Eco Sprout',       threshold: 100,  icon: '🌿' },
  { name: 'Green Warrior',    threshold: 250,  icon: '🌳' },
  { name: 'Earth Guardian',   threshold: 500,  icon: '🌍' },
  { name: 'Nature Champion',  threshold: 1000, icon: '🦋' },
  { name: 'Planet Protector', threshold: 2000, icon: '👑' },
];

const BADGES = [
  { id: 'tree-planter',     name: 'Tree Planter',     condition: 'task_category:tree_planting:3',      rarity: 'common'   },
  { id: 'waste-warrior',    name: 'Waste Warrior',    condition: 'task_category:waste_segregation:3',  rarity: 'common'   },
  { id: 'water-guardian',   name: 'Water Guardian',   condition: 'task_category:water_conservation:3', rarity: 'rare'     },
  { id: 'energy-saver',     name: 'Energy Saver',     condition: 'task_category:energy_audit:2',       rarity: 'rare'     },
  { id: 'eco-scholar',      name: 'Eco Scholar',      condition: 'lessons_completed:5',                rarity: 'common'   },
  { id: 'quiz-master',      name: 'Quiz Master',      condition: 'quiz_perfect:3',                     rarity: 'rare'     },
  { id: 'streak-7',         name: 'Streak Warrior',   condition: 'streak:7',                           rarity: 'uncommon' },
  { id: 'streak-30',        name: 'Monthly Guardian', condition: 'streak:30',                          rarity: 'epic'     },
  { id: 'climate-champion', name: 'Climate Champion', condition: 'points:500',                         rarity: 'epic'     },
  { id: 'eco-legend',       name: 'Eco Legend',       condition: 'points:2000',                        rarity: 'legendary'},
];

function getLevel(totalPoints) {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (totalPoints >= level.threshold) currentLevel = level;
    else break;
  }
  const currentIndex = LEVELS.indexOf(currentLevel);
  const nextLevel = LEVELS[currentIndex + 1] || null;
  return { current: currentLevel, next: nextLevel };
}

function awardPoints(userId, amount, reason) {
  let pointsRecord = db.findOne('points', r => r.userId === userId);
  if (!pointsRecord) {
    pointsRecord = {
      userId, totalPoints: 0, level: LEVELS[0].name, earnedBadges: [],
      pointsHistory: [],
      stats: { tasksCompleted: 0, lessonsCompleted: 0, tasksByCategory: {}, quizPerfect: 0, currentStreak: 0, longestStreak: 0, lastActiveDate: null }
    };
    db.insert('points', pointsRecord);
  }
  const oldTotal = pointsRecord.totalPoints;
  const newTotal = oldTotal + amount;
  const oldLevel = getLevel(oldTotal);
  const newLevelData = getLevel(newTotal);
  const leveledUp = oldLevel.current.name !== newLevelData.current.name;
  const newBadges = checkBadges({ ...pointsRecord, totalPoints: newTotal });
  db.update('points', r => r.userId === userId, r => ({
    totalPoints: newTotal,
    level: newLevelData.current.name,
    earnedBadges: [...new Set([...r.earnedBadges, ...newBadges.map(b => b.id)])],
    pointsHistory: [...r.pointsHistory, { amount, reason, earnedAt: new Date().toISOString() }],
  }));
  db.update('users', u => u.id === userId, () => ({ ecoPoints: newTotal, level: newLevelData.current.name }));
  return { newTotal, leveledUp, newBadges, oldLevel: oldLevel.current, newLevel: newLevelData.current, nextLevel: newLevelData.next };
}

function checkBadges(pointsRecord) {
  const newBadges = [];
  for (const badge of BADGES) {
    if (pointsRecord.earnedBadges && pointsRecord.earnedBadges.includes(badge.id)) continue;
    if (isBadgeEarned(badge, pointsRecord)) newBadges.push(badge);
  }
  return newBadges;
}

function isBadgeEarned(badge, record) {
  const parts = badge.condition.split(':');
  const type = parts[0];
  const stats = record.stats || {};
  switch (type) {
    case 'points': return record.totalPoints >= parseInt(parts[1]);
    case 'streak': return stats.currentStreak >= parseInt(parts[1]);
    case 'lessons_completed': return stats.lessonsCompleted >= parseInt(parts[1]);
    case 'task_category': return (stats.tasksByCategory?.[parts[1]] || 0) >= parseInt(parts[2]);
    case 'quiz_perfect': return stats.quizPerfect >= parseInt(parts[1]);
    default: return false;
  }
}

function updateStreak(userId) {
  const record = db.findOne('points', r => r.userId === userId);
  if (!record) return;
  const today = new Date().toDateString();
  const lastActive = record.stats?.lastActiveDate;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (lastActive === today) return;
  let newStreak = record.stats?.currentStreak || 0;
  if (lastActive === yesterday) newStreak++;
  else newStreak = 1;
  const longest = Math.max(newStreak, record.stats?.longestStreak || 0);
  db.update('points', r => r.userId === userId, r => ({
    stats: { ...r.stats, currentStreak: newStreak, longestStreak: longest, lastActiveDate: today }
  }));
  db.update('users', u => u.id === userId, () => ({ streakDays: newStreak, lastActiveDate: today }));
  return { newStreak, longest };
}

module.exports = { awardPoints, getLevel, updateStreak, LEVELS, BADGES };
