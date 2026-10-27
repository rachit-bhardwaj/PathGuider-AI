const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Ticket = require('../models/Ticket');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Get dashboard analytics summary
// @route   GET /api/admin/analytics
// @access  Private (admin, agent)
const getAnalytics = asyncHandler(async (req, res) => {
  const [totalStudents, totalConversations, totalMessages, ticketStats, categoryBreakdown, feedbackStats] =
    await Promise.all([
      User.countDocuments({ role: 'student' }),
      Conversation.countDocuments(),
      Message.countDocuments(),
      Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Conversation.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Message.aggregate([
        { $match: { sender: 'ai', feedback: { $ne: null } } },
        { $group: { _id: '$feedback', count: { $sum: 1 } } }
      ])
    ]);

  const escalatedConversations = await Conversation.countDocuments({ status: 'escalated' });

  res.status(200).json(
    new ApiResponse(200, {
      totals: {
        students: totalStudents,
        conversations: totalConversations,
        messages: totalMessages,
        escalatedConversations
      },
      ticketStats,
      categoryBreakdown,
      feedbackStats
    })
  );
});

// @desc    List all users (staff view)
// @route   GET /api/admin/users
// @access  Private (admin)
const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
  res.status(200).json(new ApiResponse(200, { users }));
});

// @desc    Update a user's role or active status
// @route   PATCH /api/admin/users/:id
// @access  Private (admin)
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');

  const { role, isActive } = req.body;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();
  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject() }, 'User updated.'));
});

module.exports = { getAnalytics, listUsers, updateUser };
