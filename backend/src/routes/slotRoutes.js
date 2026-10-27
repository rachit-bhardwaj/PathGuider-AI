const express = require('express');
const { createSlots, getMySlots, deleteSlot } = require('../controllers/slotController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('counselor'));

router.post('/', createSlots);
router.get('/mine', getMySlots);
router.delete('/:id', deleteSlot);

module.exports = router;
