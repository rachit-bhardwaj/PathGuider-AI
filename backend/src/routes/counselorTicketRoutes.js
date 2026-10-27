const express = require('express');
const {
  createTicket,
  listTickets,
  getTicket,
  getMessages,
  sendMessage,
  updateTicketStatus
} = require('../controllers/counselorTicketController');
const { protect, authorize } = require('../middleware/auth');
const { chatLimiter, pollLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Read-only GETs are skipped by the global limiter (they're polled), so cap them here — before auth.
router.use((req, res, next) => (req.method === 'GET' ? pollLimiter(req, res, next) : next()));

router.use(protect, authorize('student', 'counselor'));

router.route('/').get(listTickets).post(authorize('student'), chatLimiter, createTicket);
router.get('/:id', getTicket);
router.route('/:id/messages').get(getMessages).post(chatLimiter, sendMessage);
router.patch('/:id/status', updateTicketStatus);

module.exports = router;
