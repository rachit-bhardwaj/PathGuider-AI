const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    sender: {
      type: String,
      enum: ['user', 'ai', 'system', 'agent'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    sources: [
      {
        title: String,
        url: String
      }
    ],
    intent: {
      type: String,
      default: null
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null
    },
    flaggedForEscalation: {
      type: Boolean,
      default: false
    },
    tokensUsed: {
      type: Number,
      default: 0
    },
    feedback: {
      type: String,
      enum: ['helpful', 'not-helpful', null],
      default: null
    }
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
