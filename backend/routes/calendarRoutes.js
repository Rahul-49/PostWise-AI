const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { generateCalendarSchema } = require('../validators/schemas');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware);

router.post('/generate', aiLimiter, validate(generateCalendarSchema), calendarController.generateCalendar);
router.post('/generate-async', aiLimiter, validate(generateCalendarSchema), calendarController.generateCalendarAsync);
router.get('/jobs/:jobId', calendarController.getJobStatus);
router.get('/', calendarController.getCalendars);
router.get('/:id/export/json', calendarController.exportJSON);
router.get('/:id/export/csv', calendarController.exportCSV);
router.get('/:id', calendarController.getCalendarById);
router.delete('/:id', calendarController.deleteCalendar);

module.exports = router;
