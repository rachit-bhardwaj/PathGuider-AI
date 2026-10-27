const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Slot = require('../models/Slot');
const CounselorProfile = require('../models/CounselorProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const populateAppointment = (query) =>
  query
    .populate('counselor', 'name avatarColor')
    .populate('student', 'name email studentId department avatarColor');

// @desc    Student books a free slot
// @route   POST /api/appointments
// @access  Private (student)
const bookAppointment = asyncHandler(async (req, res) => {
  const { slotId, reason } = req.body;
  if (!slotId || !mongoose.isValidObjectId(slotId)) throw new ApiError(400, 'A valid slot is required.');

  const slot = await Slot.findById(slotId);
  if (!slot) throw new ApiError(404, 'This slot no longer exists.');

  const profile = await CounselorProfile.findOne({ user: slot.counselor });
  if (!profile || !profile.isApproved) throw new ApiError(404, 'This slot is not available.');
  if (!profile.isAcceptingStudents) throw new ApiError(409, 'This counselor is not taking new bookings right now.');

  // The student must not already be booked into this slot or an overlapping one.
  const clash = await Appointment.findOne({
    student: req.user._id,
    status: 'booked',
    startAt: { $lt: slot.endAt },
    endAt: { $gt: slot.startAt }
  });
  if (clash) {
    throw new ApiError(409, 'You already have an appointment that overlaps this time.');
  }

  // Atomic reservation: only succeeds while the slot is in the future AND still has room.
  // This is what stops two students grabbing the last seat at the same moment.
  const reserved = await Slot.findOneAndUpdate(
    { _id: slot._id, startAt: { $gt: new Date() }, $expr: { $lt: ['$bookedCount', '$capacity'] } },
    { $inc: { bookedCount: 1 } },
    { new: true }
  );
  if (!reserved) throw new ApiError(409, 'Sorry, this slot was just taken or has already passed. Please pick another.');

  let appointment;
  try {
    appointment = await Appointment.create({
      slot: reserved._id,
      student: req.user._id,
      counselor: reserved.counselor,
      startAt: reserved.startAt,
      endAt: reserved.endAt,
      location: reserved.location,
      reason: (reason || '').toString().trim().slice(0, 500)
    });
  } catch (err) {
    await Slot.updateOne({ _id: reserved._id, bookedCount: { $gt: 0 } }, { $inc: { bookedCount: -1 } });
    if (err.code === 11000) throw new ApiError(409, 'You have already booked this slot.');
    throw err;
  }

  const populated = await populateAppointment(Appointment.findById(appointment._id));
  res.status(201).json(new ApiResponse(201, { appointment: populated }, 'Appointment booked.'));
});

// @desc    List my appointments (student: ones I booked, counselor: ones booked with me)
// @route   GET /api/appointments?scope=upcoming|past
// @access  Private (student, counselor)
const listMyAppointments = asyncHandler(async (req, res) => {
  const field = req.user.role === 'counselor' ? 'counselor' : 'student';
  const filter = { [field]: req.user._id };
  const now = new Date();

  let sort = { startAt: 1 };
  if (req.query.scope === 'upcoming') {
    filter.status = 'booked';
    filter.endAt = { $gt: now };
  } else if (req.query.scope === 'past') {
    // Anything finished, cancelled or already over.
    filter.$or = [{ status: { $ne: 'booked' } }, { endAt: { $lte: now } }];
    sort = { startAt: -1 };
  }

  const appointments = await populateAppointment(Appointment.find(filter).sort(sort).limit(200));
  res.status(200).json(new ApiResponse(200, { appointments }));
});

// @desc    Cancel an appointment (frees the slot again)
// @route   PATCH /api/appointments/:id/cancel
// @access  Private (the student or the counselor on the appointment)
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found.');

  const isStudent = appointment.student.equals(req.user._id);
  const isCounselor = appointment.counselor.equals(req.user._id);
  if (!isStudent && !isCounselor) throw new ApiError(403, 'You are not part of this appointment.');

  if (appointment.status !== 'booked') throw new ApiError(409, `This appointment is already ${appointment.status}.`);
  if (appointment.startAt <= new Date()) throw new ApiError(409, 'This appointment has already started and can no longer be cancelled.');

  const updated = await Appointment.findOneAndUpdate(
    { _id: appointment._id, status: 'booked' },
    {
      status: 'cancelled',
      cancelledBy: req.user._id,
      cancelledAt: new Date(),
      cancelReason: (req.body.reason || '').toString().trim().slice(0, 300)
    },
    { new: true }
  );
  if (!updated) throw new ApiError(409, 'This appointment was already updated.');

  // Re-open the seat for other students.
  await Slot.updateOne({ _id: appointment.slot, bookedCount: { $gt: 0 } }, { $inc: { bookedCount: -1 } });

  const populated = await populateAppointment(Appointment.findById(updated._id));
  res.status(200).json(new ApiResponse(200, { appointment: populated }, 'Appointment cancelled.'));
});

// @desc    Counselor marks an appointment completed / no-show
// @route   PATCH /api/appointments/:id/status
// @access  Private (counselor)
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['completed', 'no-show'].includes(status)) throw new ApiError(400, 'Status must be "completed" or "no-show".');

  const appointment = await Appointment.findOne({ _id: req.params.id, counselor: req.user._id });
  if (!appointment) throw new ApiError(404, 'Appointment not found.');
  if (appointment.status !== 'booked') throw new ApiError(409, `This appointment is already ${appointment.status}.`);
  if (appointment.startAt > new Date()) throw new ApiError(409, 'You can only mark an appointment once it has started.');

  appointment.status = status;
  await appointment.save();

  const populated = await populateAppointment(Appointment.findById(appointment._id));
  res.status(200).json(new ApiResponse(200, { appointment: populated }, 'Appointment updated.'));
});

module.exports = { bookAppointment, listMyAppointments, cancelAppointment, updateAppointmentStatus };
