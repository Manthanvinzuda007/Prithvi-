const router = require('express').Router();
const c = require('../controllers/lessons.controller');
const auth = require('../middleware/auth');
const { requireTeacher, requireStudent } = require('../middleware/roles');

router.get('/', auth, c.getLessons);
router.post('/', auth, requireTeacher, c.createLesson);
router.put('/:id', auth, requireTeacher, c.updateLesson);
router.delete('/:id', auth, requireTeacher, c.deleteLesson);
router.post('/:id/enroll', auth, requireStudent, c.enrollLesson);
router.get('/:id/progress', auth, c.getProgress);
router.put('/:id/progress', auth, requireStudent, c.updateProgress);
router.get('/:id/analytics', auth, requireTeacher, c.getAnalytics);

module.exports = router;
