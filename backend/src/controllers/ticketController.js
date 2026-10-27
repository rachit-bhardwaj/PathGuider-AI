const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Create a support ticket
// @route   POST /api/tickets
// @access  Private (student)
const createTicket = asyncHandler(async (req, res) => {
  const { subject, description, category, priority, conversationId } = req.body;

  if (!subject || !description) {
    throw new ApiError(400, 'Subject and description are required.');
  }

  const ticket = await Ticket.create({
    student: req.user._id,
    conversation: conversationId || null,
    subject,
    description,
    category: category || 'general',
    priority: priority || 'medium'
  });

  res.status(201).json(new ApiResponse(201, { ticket }, 'Ticket submitted. Our team will follow up soon.'));
});

// @desc    List tickets (own tickets for students, all for agent/admin)
// @route   GET /api/tickets
// @access  Private
const listTickets = asyncHandler(async (req, res) => {
  const filter = ['admin', 'agent'].includes(req.user.role) ? {} : { student: req.user._id };

  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;

  const tickets = await Ticket.find(filter)
    .populate('student', 'name email studentId')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(new ApiResponse(200, { tickets }));
});

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('student', 'name email studentId')
    .populate('assignedTo', 'name email');

  if (!ticket) throw new ApiError(404, 'Ticket not found.');

  const isOwner = ticket.student._id.toString() === req.user._id.toString();
  const isStaff = ['admin', 'agent'].includes(req.user.role);
  if (!isOwner && !isStaff) throw new ApiError(403, 'Not authorized to view this ticket.');

  res.status(200).json(new ApiResponse(200, { ticket }));
});

// @desc    Update ticket status / assignment / notes (staff only)
// @route   PATCH /api/tickets/:id
// @access  Private (agent, admin)
const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new ApiError(404, 'Ticket not found.');

  const { status, priority, assignedTo, resolutionNotes } = req.body;

  if (status) {
    ticket.status = status;
    if (status === 'resolved') ticket.resolvedAt = new Date();
  }
  if (priority) ticket.priority = priority;
  if (assignedTo !== undefined) ticket.assignedTo = assignedTo || null;
  if (resolutionNotes !== undefined) ticket.resolutionNotes = resolutionNotes;

  await ticket.save();
  res.status(200).json(new ApiResponse(200, { ticket }, 'Ticket updated.'));
});

module.exports = { createTicket, listTickets, getTicket, updateTicket };
