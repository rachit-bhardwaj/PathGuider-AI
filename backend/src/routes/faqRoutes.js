const express = require('express');
const { listFaqs, createFaq, updateFaq, deleteFaq } = require('../controllers/faqController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', listFaqs);
router.post('/', protect, authorize('admin', 'agent'), createFaq);
router.put('/:id', protect, authorize('admin', 'agent'), updateFaq);
router.delete('/:id', protect, authorize('admin'), deleteFaq);

module.exports = router;
