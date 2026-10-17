const express = require('express');
const controller = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const rateLimit = require('../middleware/rateLimit');
const { auth } = require('../middleware/auth');
const validators = require('../validators/auth.validators');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post('/register', authLimiter, validate(validators.register), controller.register);
router.post('/login', authLimiter, validate(validators.login), controller.login);
router.get('/me', auth, controller.me);
router.post('/logout', auth, controller.logout);

module.exports = router;
