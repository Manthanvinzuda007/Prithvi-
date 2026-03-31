const router = require('express').Router();
const c = require('../controllers/users.controller');
const auth = require('../middleware/auth');
const { requireTeacher } = require('../middleware/roles');

router.get('/profile', auth, c.getProfile);
router.put('/profile', auth, c.updateProfile);
router.get('/students', auth, requireTeacher, c.getStudents);
router.get('/leaderboard', auth, c.getLeaderboard);
router.get('/notifications', auth, c.getNotifications);
router.put('/notifications/read-all', auth, c.markNotificationsRead);

module.exports = router;
