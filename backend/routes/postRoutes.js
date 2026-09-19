const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createPostSchema, updatePostSchema, reschedulePostSchema, regeneratePostSchema } = require('../validators/schemas');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware);

router.post('/', validate(createPostSchema), postController.createPost);
router.put('/:id', validate(updatePostSchema), postController.updatePost);
router.post('/:id/regenerate', aiLimiter, validate(regeneratePostSchema), postController.regeneratePost);
router.patch('/:id/reschedule', validate(reschedulePostSchema), postController.reschedulePost);
router.delete('/:id', postController.deletePost);
router.post('/:id/publish/linkedin', postController.publishToLinkedIn);

module.exports = router;
