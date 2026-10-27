const express = require('express');
const { getAnalytics, listUsers, updateUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/analytics', authorize('admin', 'agent'), getAnalytics);
router.get('/users', authorize('admin'), listUsers);
router.patch('/users/:id', authorize('admin'), updateUser);

module.exports = router;
