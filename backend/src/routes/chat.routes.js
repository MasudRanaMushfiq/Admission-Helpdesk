const express = require('express');
const controller = require('../controllers/chat.controller');
const validate = require('../middleware/validate');
const rateLimit = require('../middleware/rateLimit');
const { auth, requireRole } = require('../middleware/auth');
const validators = require('../validators/chat.validators');

const router = express.Router();
const chatLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

router.use(auth, requireRole('student'));

router.get('/', controller.getHistory);
router.post('/', chatLimiter, validate(validators.sendMessage), controller.sendMessage);

module.exports = router;
