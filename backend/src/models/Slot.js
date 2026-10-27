const mongoose = require('mongoose');

/**
 * A block of free time a counselor offers for a physical (in-person) meeting.
 * `capacity` is normally 1 (one student per slot). Once bookedCount reaches
 * capacity the slot is "full" and is hidden from students.
 */
const slotSchema = new mongoose.Schema(
  {
    counselor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    startAt: {
      type: Date,
      required: true
    },
    endAt: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      trim: true,
      maxlength: 120,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 200,
      default: ''
    },
    capacity: {
      type: Number,
      min: 1,
      max: 20,
      default: 1
    },
    bookedCount: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

slotSchema.index({ counselor: 1, startAt: 1 });

slotSchema.virtual('isFull').get(function isFull() {
  return this.bookedCount >= this.capacity;
});

module.exports = mongoose.model('Slot', slotSchema);
