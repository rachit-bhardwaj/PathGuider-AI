const asyncHandler = require('express-async-handler');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { generateReply } = require('../services/aiService');

// @desc    List conversations for the logged-in user
// @route   GET /api/chat/conversations
// @access  Private
const listConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ user: req.user._id }).sort({ updatedAt: -1 }).lean();
  res.status(200).json(new ApiResponse(200, { conversations }));
});

// @desc    Create a new conversation
// @route   POST /api/chat/conversations
// @access  Private
const createConversation = asyncHandler(async (req, res) => {
  const { title, category } = req.body;
  const conversation = await Conversation.create({
    user: req.user._id,
    title: title || 'New conversation',
    category: category || 'general'
  });
  res.status(201).json(new ApiResponse(201, { conversation }, 'Conversation started.'));
});

// @desc    Get a single conversation with its messages
// @route   GET /api/chat/conversations/:id
// @access  Private
const getConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.id, user: req.user._id });
  if (!conversation) throw new ApiError(404, 'Conversation not found.');

  const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 }).lean();
  res.status(200).json(new ApiResponse(200, { conversation, messages }));
});

// @desc    Delete a conversation and its messages
// @route   DELETE /api/chat/conversations/:id
// @access  Private
const deleteConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.id, user: req.user._id });
  if (!conversation) throw new ApiError(404, 'Conversation not found.');

  await Message.deleteMany({ conversation: conversation._id });
  await conversation.deleteOne();

  res.status(200).json(new ApiResponse(200, {}, 'Conversation deleted.'));
});

// @desc    Send a message and get an AI-generated reply
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    throw new ApiError(400, 'Message content cannot be empty.');
  }

  const conversation = await Conversation.findOne({ _id: req.params.id, user: req.user._id });
  if (!conversation) throw new ApiError(404, 'Conversation not found.');

  const userMessage = await Message.create({
    conversation: conversation._id,
    sender: 'user',
    content: content.trim()
  });

  const priorMessages = await Message.find({ conversation: conversation._id })
    .sort({ createdAt: 1 })
    .limit(20)
    .lean();

  const aiResult = await generateReply(
    priorMessages.map((m) => ({ sender: m.sender, content: m.content })),
    content.trim()
  );

  const aiMessage = await Message.create({
    conversation: conversation._id,
    sender: 'ai',
    content: aiResult.content,
    sources: aiResult.sources,
    intent: aiResult.intent,
    confidence: aiResult.confidence,
    flaggedForEscalation: aiResult.escalate,
    tokensUsed: aiResult.tokensUsed
  });

  conversation.lastMessagePreview = aiResult.content.slice(0, 140);
  conversation.messageCount += 2;
  if (conversation.title === 'New conversation') {
    conversation.title = content.trim().slice(0, 60);
  }
  if (aiResult.escalate) {
    conversation.status = 'escalated';
  }
  await conversation.save();

  res.status(201).json(
    new ApiResponse(201, {
      userMessage,
      aiMessage,
      escalationSuggested: aiResult.escalate
    })
  );
});

// @desc    Submit feedback (helpful / not helpful) on an AI message
// @route   PATCH /api/chat/messages/:id/feedback
// @access  Private
const submitFeedback = asyncHandler(async (req, res) => {
  const { feedback } = req.body;
  if (!['helpful', 'not-helpful'].includes(feedback)) {
    throw new ApiError(400, 'Feedback must be "helpful" or "not-helpful".');
  }

  const message = await Message.findById(req.params.id);
  if (!message) throw new ApiError(404, 'Message not found.');

  const conversation = await Conversation.findOne({ _id: message.conversation, user: req.user._id });
  if (!conversation) throw new ApiError(403, 'Not authorized to give feedback on this message.');

  message.feedback = feedback;
  await message.save();

  res.status(200).json(new ApiResponse(200, { message }, 'Feedback recorded.'));
});

module.exports = {
  listConversations,
  createConversation,
  getConversation,
  deleteConversation,
  sendMessage,
  submitFeedback
};
