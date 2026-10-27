const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: true,
      index: true
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
    // Denormalised from the slot so history stays correct even if a slot is edited/removed.
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    location: { type: String, default: '' },
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    status: {
      type: String,
      enum: ['booked', 'cancelled', 'completed', 'no-show'],
      default: 'booked',
      index: true
    },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, trim: true, maxlength: 300, default: '' }
  },
  { timestamps: true }
);

// A student can hold at most one active booking per slot (safety net against double-clicks).
appointmentSchema.index(
  { slot: 1, student: 1 },
  { unique: true, partialFilterExpression: { status: 'booked' } }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
