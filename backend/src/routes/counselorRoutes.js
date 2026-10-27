const express = require('express');
const {
  registerCounselor,
  listCounselors,
  getCounselor,
  getMyProfile,
  updateMyProfile,
  adminListCounselors,
  adminSetApproval
} = require('../controllers/counselorController');
const { getCounselorSlots } = require('../controllers/slotController');
const { protect, authorize } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, registerCounselor);

router.use(protect);

// Fixed paths first so they are not swallowed by "/:id".
router.get('/me/profile', authorize('counselor'), getMyProfile);
router.put('/me/profile', authorize('counselor'), updateMyProfile);
router.get('/admin/all', authorize('admin'), adminListCounselors);
router.patch('/admin/:id/approval', authorize('admin'), adminSetApproval);

router.get('/', listCounselors);
router.get('/:id', getCounselor);
router.get('/:id/slots', getCounselorSlots);

module.exports = router;
