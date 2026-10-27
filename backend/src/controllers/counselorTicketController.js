const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const CounselorTicket = require('../models/CounselorTicket');
const TicketMessage = require('../models/TicketMessage');
const CounselorProfile = require('../models/CounselorProfile');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const MAX_OPEN_TICKETS_PER_STUDENT = 5;

const previewOf = (text) => text.replace(/\s+/g, ' ').trim().slice(0, 120);

const populateTicket = (query) =>
  query.populate('student', 'name studentId department avatarColor').populate('counselor', 'name avatarColor');

// Loads a ticket only if the requester is its student or its counselor.
// Anyone else gets a 404 so ticket ids can't be probed.
const loadTicketForUser = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, 'Ticket not found.');
  const ticket = await CounselorTicket.findById(id);
  if (!ticket) throw new ApiError(404, 'Ticket not found.');

  const isStudent = ticket.student.equals(user._id);
  const isCounselor = ticket.counselor.equals(user._id);
  if (!isStudent && !isCounselor) throw new ApiError(404, 'Ticket not found.');

  return { ticket, viewerRole: isStudent ? 'student' : 'counselor' };
};

// Shape sent to the client: adds the viewer's own unread count and whether they may send right now.
const toTicketDTO = (ticketDoc, viewerRole) => {
  const t = ticketDoc.toObject ? ticketDoc.toObject() : ticketDoc;
  const unread = viewerRole === 'student' ? t.unreadForStudent : t.unreadForCounselor;

  let canSend = true;
  let sendBlockedReason = '';
  if (t.status === 'closed') {
    canSend = false;
    sendBlockedReason = 'This ticket is closed. Reopen it to continue the conversation.';
  } else if (viewerRole === 'student' && t.status === 'pending') {
    canSend = false;
    sendBlockedReason = 'Your query has been sent. You can continue the chat once the counselor replies.';
  }

  return { ...t, unread, viewerRole, canSend, sendBlockedReason };
};

const markRead = async (ticket, viewerRole) => {
  const field = viewerRole === 'student' ? 'unreadForStudent' : 'unreadForCounselor';
  if (ticket[field] > 0) {
    await CounselorTicket.updateOne({ _id: ticket._id }, { $set: { [field]: 0 } });
    // eslint-disable-next-line no-param-reassign
    ticket[field] = 0;
  }
};

// @desc    Student sends a new query to a counselor (opens a ticket)
// @route   POST /api/counselor-tickets
// @access  Private (student)
const createTicket = asyncHandler(async (req, res) => {
  const { counselorId, subject, message, category } = req.body;

  if (!counselorId || !mongoose.isValidObjectId(counselorId)) throw new ApiError(400, 'Please choose a counselor.');
  if (!subject || !subject.toString().trim()) throw new ApiError(400, 'Subject is required.');
  if (!message || !message.toString().trim()) throw new ApiError(400, 'Please describe your query.');
  if (message.length > 2000) throw new ApiError(400, 'Message is too long (max 2000 characters).');

  const counselor = await User.findOne({ _id: counselorId, role: 'counselor', isActive: true }).select('_id');
  const profile = counselor && (await CounselorProfile.findOne({ user: counselor._id }));
  if (!counselor || !profile || !profile.isApproved) throw new ApiError(404, 'Counselor not found.');
  if (!profile.isAcceptingStudents) throw new ApiError(409, 'This counselor is not accepting new messages right now.');

  const openCount = await CounselorTicket.countDocuments({ student: req.user._id, status: { $ne: 'closed' } });
  if (openCount >= MAX_OPEN_TICKETS_PER_STUDENT) {
    throw new ApiError(409, `You already have ${MAX_OPEN_TICKETS_PER_STUDENT} open tickets. Please close one before starting another.`);
  }

  const content = message.toString().trim();
  const ticket = await CounselorTicket.create({
    student: req.user._id,
    counselor: counselor._id,
    subject: subject.toString().trim().slice(0, 150),
    category: category || 'other',
    lastMessageAt: new Date(),
    lastMessagePreview: previewOf(content),
    lastMessageBy: 'student',
    unreadForCounselor: 1
  });

  await TicketMessage.create({ ticket: ticket._id, sender: req.user._id, senderRole: 'student', content });

  const populated = await populateTicket(CounselorTicket.findById(ticket._id));
  res.status(201).json(new ApiResponse(201, { ticket: toTicketDTO(populated, 'student') }, 'Your query has been sent to the counselor.'));
});

// @desc    List my tickets (student: tickets I opened, counselor: tickets addressed to me)
// @route   GET /api/counselor-tickets?status=
// @access  Private (student, counselor)
const listTickets = asyncHandler(async (req, res) => {
  const viewerRole = req.user.role === 'counselor' ? 'counselor' : 'student';
  const filter = { [viewerRole]: req.user._id };
  if (['pending', 'active', 'closed'].includes(req.query.status)) filter.status = req.query.status;

  const tickets = await populateTicket(CounselorTicket.find(filter).sort({ lastMessageAt: -1 }).limit(200));
  const unreadTotal = tickets.reduce((sum, t) => sum + (viewerRole === 'student' ? t.unreadForStudent : t.unreadForCounselor), 0);

  res.status(200).json(new ApiResponse(200, { tickets: tickets.map((t) => toTicketDTO(t, viewerRole)), unreadTotal }));
});

// @desc    Open a ticket: returns the ticket and the whole conversation (and marks it read)
// @route   GET /api/counselor-tickets/:id
// @access  Private (student or counselor on the ticket)
const getTicket = asyncHandler(async (req, res) => {
  const { ticket: base, viewerRole } = await loadTicketForUser(req.params.id, req.user);
  await markRead(base, viewerRole);

  const ticket = await populateTicket(CounselorTicket.findById(base._id));
  const messages = await TicketMessage.find({ ticket: base._id }).sort({ createdAt: 1 }).limit(1000).lean();

  res.status(200).json(new ApiResponse(200, { ticket: toTicketDTO(ticket, viewerRole), messages }));
});

// @desc    Poll for new messages (cheap incremental fetch used by the chat screen)
// @route   GET /api/counselor-tickets/:id/messages?after=<ISO date>
// @access  Private (student or counselor on the ticket)
const getMessages = asyncHandler(async (req, res) => {
  const { ticket: base, viewerRole } = await loadTicketForUser(req.params.id, req.user);

  const filter = { ticket: base._id };
  if (req.query.after) {
    const after = new Date(req.query.after);
    if (Number.isNaN(after.getTime())) throw new ApiError(400, 'Invalid "after" timestamp.');
    filter.createdAt = { $gt: after };
  }
  const messages = await TicketMessage.find(filter).sort({ createdAt: 1 }).limit(500).lean();

  await markRead(base, viewerRole);
  const ticket = await populateTicket(CounselorTicket.findById(base._id));

  res.status(200).json(new ApiResponse(200, { ticket: toTicketDTO(ticket, viewerRole), messages }));
});

// @desc    Send a chat message inside a ticket
// @route   POST /api/counselor-tickets/:id/messages
// @access  Private (student or counselor on the ticket)
const sendMessage = asyncHandler(async (req, res) => {
  const { ticket, viewerRole } = await loadTicketForUser(req.params.id, req.user);
  const content = (req.body.content || '').toString().trim();

  if (!content) throw new ApiError(400, 'Message cannot be empty.');
  if (content.length > 2000) throw new ApiError(400, 'Message is too long (max 2000 characters).');

  if (ticket.status === 'closed') {
    throw new ApiError(409, 'This ticket is closed. Reopen it to continue the conversation.');
  }
  if (viewerRole === 'student' && ticket.status === 'pending') {
    throw new ApiError(403, 'Please wait for the counselor to reply before sending more messages.');
  }

  const message = await TicketMessage.create({
    ticket: ticket._id,
    sender: req.user._id,
    senderRole: viewerRole,
    content
  });

  const update = {
    $set: {
      lastMessageAt: message.createdAt,
      lastMessagePreview: previewOf(content),
      lastMessageBy: viewerRole
    },
    $inc: viewerRole === 'student' ? { unreadForCounselor: 1 } : { unreadForStudent: 1 }
  };
  // The counselor's first reply unlocks the chat for the student.
  if (viewerRole === 'counselor' && ticket.status === 'pending') {
    update.$set.status = 'active';
    update.$set.counselorHasReplied = true;
  }
  await CounselorTicket.updateOne({ _id: ticket._id }, update);

  const fresh = await populateTicket(CounselorTicket.findById(ticket._id));
  res.status(201).json(new ApiResponse(201, { message, ticket: toTicketDTO(fresh, viewerRole) }));
});

// @desc    Close or reopen a ticket
// @route   PATCH /api/counselor-tickets/:id/status   body: { status: 'closed' | 'reopen' }
// @access  Private (student or counselor on the ticket)
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { ticket, viewerRole } = await loadTicketForUser(req.params.id, req.user);
  const { status } = req.body;

  if (status === 'closed') {
    if (ticket.status === 'closed') throw new ApiError(409, 'Ticket is already closed.');
    ticket.status = 'closed';
    ticket.closedAt = new Date();
    ticket.closedBy = req.user._id;
  } else if (status === 'reopen') {
    if (ticket.status !== 'closed') throw new ApiError(409, 'Only closed tickets can be reopened.');
    ticket.status = ticket.counselorHasReplied ? 'active' : 'pending';
    ticket.closedAt = null;
    ticket.closedBy = null;
  } else {
    throw new ApiError(400, 'Status must be "closed" or "reopen".');
  }

  await ticket.save();
  const fresh = await populateTicket(CounselorTicket.findById(ticket._id));
  res
    .status(200)
    .json(new ApiResponse(200, { ticket: toTicketDTO(fresh, viewerRole) }, status === 'closed' ? 'Ticket closed.' : 'Ticket reopened.'));
});

module.exports = { createTicket, listTickets, getTicket, getMessages, sendMessage, updateTicketStatus };
