const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/generate', calendarController.generateCalendar);
router.get('/', calendarController.getCalendars);
router.get('/:id/export/json', calendarController.exportJSON);
router.get('/:id/export/csv', calendarController.exportCSV);
router.get('/:id', calendarController.getCalendarById);
router.delete('/:id', calendarController.deleteCalendar);

module.exports = router;
