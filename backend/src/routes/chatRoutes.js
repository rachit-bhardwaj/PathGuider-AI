const express = require('express');
const {
  listConversations,
  createConversation,
  getConversation,
  deleteConversation,
  sendMessage,
  submitFeedback
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect);

router.route('/conversations').get(listConversations).post(createConversation);
router.route('/conversations/:id').get(getConversation).delete(deleteConversation);
router.post('/conversations/:id/messages', chatLimiter, sendMessage);
router.patch('/messages/:id/feedback', submitFeedback);

module.exports = router;
