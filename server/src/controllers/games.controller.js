const db = require('../config/db');
const { awardPoints } = require('../utils/points');

function getQuestions(req, res) {
  const { category, difficulty, count = 10 } = req.query;
  let questions = db.readDB('game_questions');
  if (category) questions = questions.filter(q => q.category === category);
  if (difficulty) questions = questions.filter(q => q.difficulty === difficulty);
  // Shuffle
  questions = questions.sort(() => Math.random() - 0.5).slice(0, parseInt(count));
  // Strip correct answer from response
  const sanitized = questions.map(({ correctIndex, ...q }) => q);
  res.json({ questions: sanitized });
}

function checkAnswers(req, res) {
  const { gameType, answers } = req.body;
  if (!answers || !Array.isArray(answers)) return res.status(400).json({ error: 'Answers array required' });
  const allQuestions = db.readDB('game_questions');
  let score = 0; let totalPossible = 0;
  const breakdown = answers.map(a => {
    const q = allQuestions.find(q => q.id === a.questionId);
    if (!q) return { questionId: a.questionId, correct: false };
    const correct = a.selectedIndex === q.correctIndex;
    if (correct) score += q.xpReward;
    totalPossible += q.xpReward;
    return { questionId: a.questionId, correct, correctIndex: q.correctIndex, explanation: q.explanation, xpEarned: correct ? q.xpReward : 0 };
  });
  let xpEarned = score;
  if (xpEarned > 0) awardPoints(req.user.id, xpEarned, `Quiz Blitz: ${score}/${totalPossible} points`);
  res.json({ score, totalPossible, breakdown, xpEarned });
}

function saveScore(req, res) {
  const { gameType, score, timeTaken } = req.body;
  const scores = db.readDB('game_scores');
  const existing = scores.find(s => s.userId === req.user.id && s.gameType === gameType);
  const isNewHighScore = !existing || score > existing.score;
  if (isNewHighScore) {
    if (existing) {
      db.update('game_scores', s => s.userId === req.user.id && s.gameType === gameType, () => ({ score, timeTaken, achievedAt: new Date().toISOString() }));
    } else {
      db.insert('game_scores', { userId: req.user.id, gameType, score, timeTaken, achievedAt: new Date().toISOString() });
    }
  }
  const xpEarned = isNewHighScore ? 25 : 10;
  awardPoints(req.user.id, xpEarned, `Game played: ${gameType}`);
  res.json({ isNewHighScore, xpEarned });
}

function getMyScores(req, res) {
  const scores = db.findAll('game_scores', s => s.userId === req.user.id);
  res.json({ scores });
}

function getScoreLeaderboard(req, res) {
  const scores = db.readDB('game_scores');
  const gameTypes = [...new Set(scores.map(s => s.gameType))];
  const leaderboard = {};
  gameTypes.forEach(gt => {
    const gtScores = scores.filter(s => s.gameType === gt).sort((a,b) => b.score - a.score).slice(0,10);
    leaderboard[gt] = gtScores.map((s,i) => {
      const user = db.findOne('users', u => u.id === s.userId);
      return { rank: i+1, ...s, userName: user?.name || 'Unknown', avatarId: user?.avatarId || 1 };
    });
  });
  res.json({ leaderboard });
}

module.exports = { getQuestions, checkAnswers, saveScore, getMyScores, getScoreLeaderboard };
