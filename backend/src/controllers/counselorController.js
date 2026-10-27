const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const CounselorProfile = require('../models/CounselorProfile');
const Slot = require('../models/Slot');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: (Number(process.env.COOKIE_EXPIRES_DAYS) || 7) * 24 * 60 * 60 * 1000
});

const parseLanguages = (value) => {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean).slice(0, 10);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 10);
  }
  return [];
};

// Public-safe representation of a counselor (never exposes email or password).
const toCounselorDTO = (user, profile, extra = {}) => ({
  id: user._id,
  name: user.name,
  avatarColor: user.avatarColor,
  specialization: profile.specialization,
  bio: profile.bio,
  qualifications: profile.qualifications,
  experienceYears: profile.experienceYears,
  languages: profile.languages,
  officeLocation: profile.officeLocation,
  department: profile.department,
  photoUrl: profile.photoUrl,
  isAcceptingStudents: profile.isAcceptingStudents,
  isApproved: profile.isApproved,
  ...extra
});

// Counts upcoming, not-full slots per counselor (what a student could actually book).
const availableSlotCounts = async (counselorIds) => {
  if (!counselorIds.length) return {};
  const rows = await Slot.aggregate([
    {
      $match: {
        counselor: { $in: counselorIds },
        startAt: { $gt: new Date() },
        $expr: { $lt: ['$bookedCount', '$capacity'] }
      }
    },
    { $group: { _id: '$counselor', count: { $sum: 1 } } }
  ]);
  return rows.reduce((acc, r) => ({ ...acc, [r._id.toString()]: r.count }), {});
};

// @desc    Register a new counselor (account stays "pending" until an admin approves it)
// @route   POST /api/counselors/register
// @access  Public
const registerCounselor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    specialization,
    bio,
    qualifications,
    experienceYears,
    languages,
    officeLocation,
    department,
    inviteCode
  } = req.body;

  if (!name || !email || !password || !specialization) {
    throw new ApiError(400, 'Name, email, password and specialization are required.');
  }
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters.');
  }

  // Optional extra gate: if the institution sets COUNSELOR_INVITE_CODE, it must match.
  const requiredCode = process.env.COUNSELOR_INVITE_CODE;
  if (requiredCode && inviteCode !== requiredCode) {
    throw new ApiError(403, 'A valid counselor invite code is required to register.');
  }

  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'counselor',
    department: department || null
  });

  let profile;
  try {
    profile = await CounselorProfile.create({
      user: user._id,
      specialization,
      bio,
      qualifications,
      experienceYears: Number(experienceYears) || 0,
      languages: parseLanguages(languages),
      officeLocation,
      department
    });
  } catch (err) {
    // Don't leave a half-created account behind.
    await User.deleteOne({ _id: user._id });
    throw err;
  }

  const token = user.generateToken();
  res
    .status(201)
    .cookie('token', token, cookieOptions())
    .json(
      new ApiResponse(
        201,
        { user: user.toSafeObject(), token, profile: toCounselorDTO(user, profile) },
        'Registration successful. An administrator will review and approve your account shortly.'
      )
    );
});

// @desc    List approved counselors (for students to browse)
// @route   GET /api/counselors
// @access  Private
const listCounselors = asyncHandler(async (req, res) => {
  const profiles = await CounselorProfile.find({ isApproved: true }).populate({
    path: 'user',
    match: { isActive: true, role: 'counselor' },
    select: 'name avatarColor'
  });

  const valid = profiles.filter((p) => p.user);
  const counts = await availableSlotCounts(valid.map((p) => p.user._id));

  const counselors = valid
    .map((p) => toCounselorDTO(p.user, p, { availableSlots: counts[p.user._id.toString()] || 0 }))
    .sort((a, b) => b.availableSlots - a.availableSlots || a.name.localeCompare(b.name));

  res.status(200).json(new ApiResponse(200, { counselors }));
});

// @desc    Get one counselor's public profile
// @route   GET /api/counselors/:id
// @access  Private
const getCounselor = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'counselor', isActive: true }).select(
    'name avatarColor'
  );
  const profile = user && (await CounselorProfile.findOne({ user: user._id }));

  const isSelf = user && user._id.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!user || !profile || (!profile.isApproved && !isSelf && !isAdmin)) {
    throw new ApiError(404, 'Counselor not found.');
  }

  const counts = await availableSlotCounts([user._id]);
  res
    .status(200)
    .json(new ApiResponse(200, { counselor: toCounselorDTO(user, profile, { availableSlots: counts[user._id.toString()] || 0 }) }));
});

// @desc    Get my own counselor profile
// @route   GET /api/counselors/me/profile
// @access  Private (counselor)
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await CounselorProfile.findOne({ user: req.user._id });
  if (!profile) throw new ApiError(404, 'Counselor profile not found.');
  res.status(200).json(new ApiResponse(200, { profile: toCounselorDTO(req.user, profile) }));
});

// @desc    Update my own counselor profile
// @route   PUT /api/counselors/me/profile
// @access  Private (counselor)
const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await CounselorProfile.findOne({ user: req.user._id });
  if (!profile) throw new ApiError(404, 'Counselor profile not found.');

  const { name, specialization, bio, qualifications, experienceYears, languages, officeLocation, department, isAcceptingStudents } =
    req.body;

  if (name !== undefined) {
    if (!String(name).trim()) throw new ApiError(400, 'Name cannot be empty.');
    req.user.name = String(name).trim();
    await req.user.save({ validateBeforeSave: false });
  }
  if (specialization !== undefined) {
    if (!String(specialization).trim()) throw new ApiError(400, 'Specialization cannot be empty.');
    profile.specialization = specialization;
  }
  if (bio !== undefined) profile.bio = bio;
  if (qualifications !== undefined) profile.qualifications = qualifications;
  if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears) || 0;
  if (languages !== undefined) profile.languages = parseLanguages(languages);
  if (officeLocation !== undefined) profile.officeLocation = officeLocation;
  if (department !== undefined) profile.department = department;
  if (isAcceptingStudents !== undefined) profile.isAcceptingStudents = Boolean(isAcceptingStudents);

  await profile.save();
  res.status(200).json(new ApiResponse(200, { profile: toCounselorDTO(req.user, profile) }, 'Profile updated.'));
});

// @desc    Admin: list all counselor registrations (pending + approved)
// @route   GET /api/counselors/admin/all
// @access  Private (admin)
const adminListCounselors = asyncHandler(async (req, res) => {
  const profiles = await CounselorProfile.find()
    .populate('user', 'name email isActive createdAt avatarColor')
    .sort({ isApproved: 1, createdAt: -1 });

  const counselors = profiles
    .filter((p) => p.user)
    .map((p) => ({
      ...toCounselorDTO(p.user, p),
      email: p.user.email,
      isActive: p.user.isActive,
      registeredAt: p.user.createdAt,
      approvedAt: p.approvedAt
    }));

  res.status(200).json(new ApiResponse(200, { counselors }));
});

// @desc    Admin: approve or revoke a counselor
// @route   PATCH /api/counselors/admin/:id/approval
// @access  Private (admin)
const adminSetApproval = asyncHandler(async (req, res) => {
  const { approved } = req.body;
  if (typeof approved !== 'boolean') throw new ApiError(400, '"approved" must be true or false.');

  const profile = await CounselorProfile.findOne({ user: req.params.id });
  if (!profile) throw new ApiError(404, 'Counselor not found.');

  profile.isApproved = approved;
  profile.approvedAt = approved ? new Date() : null;
  profile.approvedBy = approved ? req.user._id : null;
  await profile.save();

  res.status(200).json(new ApiResponse(200, { isApproved: profile.isApproved }, approved ? 'Counselor approved.' : 'Approval revoked.'));
});

module.exports = {
  registerCounselor,
  listCounselors,
  getCounselor,
  getMyProfile,
  updateMyProfile,
  adminListCounselors,
  adminSetApproval
};
