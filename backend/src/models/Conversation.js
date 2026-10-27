const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      default: 'New conversation',
      trim: true,
      maxlength: 120
    },
    category: {
      type: String,
      enum: ['admissions', 'financial-aid', 'academics', 'housing', 'technical', 'wellness', 'general'],
      default: 'general'
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'escalated'],
      default: 'active'
    },
    lastMessagePreview: {
      type: String,
      default: ''
    },
    messageCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

conversationSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
