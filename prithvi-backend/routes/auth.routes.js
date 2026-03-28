// auth.routes.js
const router = require('express').Router();
const c = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', auth, c.me);
module.exports = router;
