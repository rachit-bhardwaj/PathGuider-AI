const mongoose = require('mongoose');

/**
 * Extra, counselor-only information that hangs off a User with role "counselor".
 * Kept in its own collection so the existing User model stays lean.
 */
const counselorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      maxlength: 80
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    qualifications: {
      type: String,
      trim: true,
      maxlength: 300,
      default: ''
    },
    experienceYears: {
      type: Number,
      min: 0,
      max: 60,
      default: 0
    },
    languages: [{ type: String, trim: true, maxlength: 30 }],
    officeLocation: {
      type: String,
      trim: true,
      maxlength: 120,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ''
    },
    photoUrl: {
      type: String,
      trim: true,
      default: ''
    },
    // Students only see counselors that an admin has approved.
    isApproved: {
      type: Boolean,
      default: false,
      index: true
    },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // Counselor can pause new messages / bookings without leaving the platform.
    isAcceptingStudents: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CounselorProfile', counselorProfileSchema);
