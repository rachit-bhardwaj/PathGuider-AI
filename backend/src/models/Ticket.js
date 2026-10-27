const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      default: null
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['admissions', 'financial-aid', 'academics', 'housing', 'technical', 'wellness', 'general'],
      default: 'general'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolutionNotes: {
      type: String,
      default: ''
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

ticketSchema.pre('validate', function generateTicketNumber(next) {
  if (!this.ticketNumber) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.ticketNumber = `SSK-${Date.now().toString().slice(-6)}${rand}`;
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
