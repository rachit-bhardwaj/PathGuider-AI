const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * A "ticket" in the counselor system is a private, messenger-style thread
 * between ONE student and ONE counselor.
 *
 *   pending -> student has sent the query, waiting for the counselor's first reply
 *   active  -> counselor has replied; both sides can now chat freely
 *   closed  -> read-only until someone reopens it
 *
 * (This is separate from the older form-based `Ticket` model, which is untouched.)
 */
const counselorTicketSchema = new mongoose.Schema(
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
    counselor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: 150
    },
    category: {
      type: String,
      enum: ['academic', 'career', 'personal', 'mental-health', 'other'],
      default: 'other'
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'closed'],
      default: 'pending',
      index: true
    },
    // Whether the counselor has ever replied (decides pending vs active on reopen).
    counselorHasReplied: {
      type: Boolean,
      default: false
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    },
    lastMessagePreview: {
      type: String,
      default: ''
    },
    lastMessageBy: {
      type: String,
      enum: ['student', 'counselor', null],
      default: null
    },
    unreadForStudent: { type: Number, default: 0 },
    unreadForCounselor: { type: Number, default: 0 },
    closedAt: { type: Date, default: null },
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

counselorTicketSchema.index({ student: 1, lastMessageAt: -1 });
counselorTicketSchema.index({ counselor: 1, lastMessageAt: -1 });

counselorTicketSchema.pre('validate', function generateTicketNumber(next) {
  if (!this.ticketNumber) {
    this.ticketNumber = `CT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('CounselorTicket', counselorTicketSchema);
