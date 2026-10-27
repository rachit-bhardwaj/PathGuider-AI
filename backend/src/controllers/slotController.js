const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Slot = require('../models/Slot');
const User = require('../models/User');
const CounselorProfile = require('../models/CounselorProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const MAX_SLOTS_PER_REQUEST = 60;
const MIN_SLOT_MINUTES = 10;
const MAX_SLOT_MINUTES = 8 * 60;

const requireApprovedCounselor = async (userId) => {
  const profile = await CounselorProfile.findOne({ user: userId });
  if (!profile || !profile.isApproved) {
    throw new ApiError(403, 'Your counselor account is awaiting admin approval. You can add slots once it is approved.');
  }
  return profile;
};

// @desc    Counselor adds one or more free time slots
// @route   POST /api/slots
// @access  Private (counselor)
const createSlots = asyncHandler(async (req, res) => {
  const profile = await requireApprovedCounselor(req.user._id);
  const { slots, location, notes } = req.body;
  const capacity = req.body.capacity === undefined ? 1 : Number(req.body.capacity);

  if (!Array.isArray(slots) || slots.length === 0) {
    throw new ApiError(400, 'Provide at least one time slot.');
  }
  if (slots.length > MAX_SLOTS_PER_REQUEST) {
    throw new ApiError(400, `You can add at most ${MAX_SLOTS_PER_REQUEST} slots at once.`);
  }
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 20) {
    throw new ApiError(400, 'Capacity must be a whole number between 1 and 20.');
  }

  const now = new Date();
  const parsed = slots.map((s) => ({ startAt: new Date(s?.startAt), endAt: new Date(s?.endAt) }));

  for (const s of parsed) {
    if (Number.isNaN(s.startAt.getTime()) || Number.isNaN(s.endAt.getTime())) {
      throw new ApiError(400, 'One of the slots has an invalid date or time.');
    }
    if (s.startAt <= now) throw new ApiError(400, 'Slots must start in the future.');
    const minutes = (s.endAt - s.startAt) / 60000;
    if (minutes < MIN_SLOT_MINUTES) throw new ApiError(400, `A slot must be at least ${MIN_SLOT_MINUTES} minutes long.`);
    if (minutes > MAX_SLOT_MINUTES) throw new ApiError(400, 'A single slot cannot be longer than 8 hours.');
  }

  // Overlap inside the request itself.
  const sorted = [...parsed].sort((a, b) => a.startAt - b.startAt);
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].startAt < sorted[i - 1].endAt) {
      throw new ApiError(400, 'Some of the slots you entered overlap each other.');
    }
  }

  // Overlap with slots this counselor already published.
  const clash = await Slot.findOne({
    counselor: req.user._id,
    startAt: { $lt: sorted[sorted.length - 1].endAt },
    endAt: { $gt: sorted[0].startAt },
    $or: sorted.map((s) => ({ startAt: { $lt: s.endAt }, endAt: { $gt: s.startAt } }))
  });
  if (clash) {
    throw new ApiError(409, 'One or more of these times overlap a slot you already added.');
  }

  const docs = await Slot.insertMany(
    sorted.map((s) => ({
      counselor: req.user._id,
      startAt: s.startAt,
      endAt: s.endAt,
      location: (location || profile.officeLocation || '').toString().trim().slice(0, 120),
      notes: (notes || '').toString().trim().slice(0, 200),
      capacity
    }))
  );

  res.status(201).json(new ApiResponse(201, { slots: docs }, `${docs.length} slot${docs.length > 1 ? 's' : ''} added.`));
});

// @desc    Counselor lists their own slots (upcoming by default)
// @route   GET /api/slots/mine?past=true
// @access  Private (counselor)
const getMySlots = asyncHandler(async (req, res) => {
  const past = req.query.past === 'true';
  const now = new Date();

  const filter = { counselor: req.user._id, endAt: past ? { $lte: now } : { $gt: now } };
  const slots = await Slot.find(filter)
    .sort({ startAt: past ? -1 : 1 })
    .limit(past ? 100 : 500);

  res.status(200).json(new ApiResponse(200, { slots }));
});

// @desc    Counselor removes a slot that nobody has booked
// @route   DELETE /api/slots/:id
// @access  Private (counselor)
const deleteSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findOne({ _id: req.params.id, counselor: req.user._id });
  if (!slot) throw new ApiError(404, 'Slot not found.');
  if (slot.bookedCount > 0) {
    throw new ApiError(409, 'This slot already has a booking. Cancel the appointment first, then remove the slot.');
  }
  await slot.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, 'Slot removed.'));
});

// @desc    Bookable slots for one counselor (full / past slots are hidden)
// @route   GET /api/counselors/:id/slots
// @access  Private
const getCounselorSlots = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, 'Counselor not found.');

  const counselor = await User.findOne({ _id: req.params.id, role: 'counselor', isActive: true }).select('_id');
  const profile = counselor && (await CounselorProfile.findOne({ user: counselor._id }));
  if (!counselor || !profile || !profile.isApproved) throw new ApiError(404, 'Counselor not found.');

  const slots = await Slot.find({
    counselor: counselor._id,
    startAt: { $gt: new Date() },
    $expr: { $lt: ['$bookedCount', '$capacity'] }
  })
    .sort({ startAt: 1 })
    .limit(200)
    .lean();

  const visible = slots.map((s) => ({
    _id: s._id,
    startAt: s.startAt,
    endAt: s.endAt,
    location: s.location,
    notes: s.notes,
    capacity: s.capacity,
    spotsLeft: s.capacity - s.bookedCount
  }));

  res.status(200).json(new ApiResponse(200, { slots: visible, isAcceptingStudents: profile.isAcceptingStudents }));
});

module.exports = { createSlots, getMySlots, deleteSlot, getCounselorSlots };
