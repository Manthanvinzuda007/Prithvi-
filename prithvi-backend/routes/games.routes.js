const router = require('express').Router();
const c = require('../controllers/games.controller');
const auth = require('../middleware/auth');
router.get('/questions', auth, c.getQuestions);
router.post('/check-answers', auth, c.checkAnswers);
router.post('/score', auth, c.saveScore);
router.get('/scores/my', auth, c.getMyScores);
router.get('/scores/leaderboard', auth, c.getScoreLeaderboard);
module.exports = router;
