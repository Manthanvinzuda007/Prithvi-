const router = require('express').Router();
const c = require('../controllers/tasks.controller');
const auth = require('../middleware/auth');
const { requireTeacher, requireStudent } = require('../middleware/roles');

router.get('/', auth, c.getTasks);
router.post('/', auth, requireTeacher, c.createTask);
router.get('/:id', auth, c.getTask);
router.put('/:id', auth, requireTeacher, c.updateTask);
router.delete('/:id', auth, requireTeacher, c.deleteTask);
router.post('/:id/submit', auth, requireStudent, c.submitTask);
router.put('/:id/review/:studentId', auth, requireTeacher, c.reviewTask);

module.exports = router;
