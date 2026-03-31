// points.routes.js
const router = require('express').Router();
const c = require('../controllers/points.controller');
const auth = require('../middleware/auth');
router.get('/my', auth, c.getMyPoints);
router.get('/badges', auth, c.getBadges);
router.get('/history', auth, c.getHistory);
router.get('/leaderboard', auth, c.getLeaderboard);
module.exports = router;
