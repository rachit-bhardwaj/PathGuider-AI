const express = require('express');
const { createTicket, listTickets, getTicket, updateTicket } = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(listTickets).post(createTicket);
router.get('/:id', getTicket);
router.patch('/:id', authorize('admin', 'agent'), updateTicket);

module.exports = router;
