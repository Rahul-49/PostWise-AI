const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/schemas');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
