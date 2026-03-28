const router = require('express').Router();
const c = require('../controllers/contests.controller');
const auth = require('../middleware/auth');
router.get('/pledges', auth, c.getPledges);
router.post('/pledges', auth, c.createPledge);
router.post('/pledges/:id/like', auth, c.likePledge);
router.delete('/pledges/:id', auth, c.deletePledge);
module.exports = router;
