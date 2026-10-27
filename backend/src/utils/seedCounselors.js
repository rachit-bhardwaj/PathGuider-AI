// Optional demo data for the counselor feature. Safe to re-run.
//   npm run seed:counselors
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const CounselorProfile = require('../models/CounselorProfile');
const Slot = require('../models/Slot');
const logger = require('./logger');

const DEMO_PASSWORD = 'Counselor@123';

const counselors = [
  {
    name: 'Ruchika Gupta',
    email: 'ruchika@campus.edu',
    specialization: 'Academic & Career Counselor',
    bio: 'Helps students plan their courses, build study habits and explore career paths.',
    qualifications: 'M.A. Psychology, Certified Career Counselor',
    experienceYears: 7,
    languages: ['English', 'Hindi'],
    officeLocation: 'Counseling Centre, Room 12',
    photoUrl: '/images/counselor-1.jpg'
  },
  {
    name: 'Vibhor Sharma',
    email: 'vibhor@campus.edu',
    specialization: 'Personal Wellness Counselor',
    bio: 'Supports students with stress, motivation, relationships and everyday wellbeing.',
    qualifications: 'M.Sc. Counselling Psychology',
    experienceYears: 5,
    languages: ['English', 'Hindi'],
    officeLocation: 'Counseling Centre, Room 14',
    photoUrl: '/images/counselor-2.jpg'
  },
  {
    name: 'Anju Verma',
    email: 'anju@campus.edu',
    specialization: 'Mental Health Counselor',
    bio: 'A safe, confidential space to talk about anxiety, low mood, trauma and burnout.',
    qualifications: 'M.Phil. Clinical Psychology',
    experienceYears: 9,
    languages: ['English', 'Hindi', 'Punjabi'],
    officeLocation: 'Counseling Centre, Room 3',
    photoUrl: '/images/counselor-3.jpg'
  }
];

const run = async () => {
  await connectDB();

  for (const c of counselors) {
    let user = await User.findOne({ email: c.email });
    if (!user) {
      user = await User.create({ name: c.name, email: c.email, password: DEMO_PASSWORD, role: 'counselor' });
      logger.info(`Created counselor ${c.email} / ${DEMO_PASSWORD}`);
    }
    let profile = await CounselorProfile.findOne({ user: user._id });
    if (!profile) {
      profile = await CounselorProfile.create({
        user: user._id,
        specialization: c.specialization,
        bio: c.bio,
        qualifications: c.qualifications,
        experienceYears: c.experienceYears,
        languages: c.languages,
        officeLocation: c.officeLocation,
        photoUrl: c.photoUrl,
        isApproved: true,
        approvedAt: new Date()
      });
    }

    // Add a few future slots (next 3 weekdays, 11:00 and 14:00, 45 min) if none exist yet.
    const hasFuture = await Slot.exists({ counselor: user._id, startAt: { $gt: new Date() } });
    if (!hasFuture) {
      const docs = [];
      const day = new Date();
      let added = 0;
      while (added < 3) {
        day.setDate(day.getDate() + 1);
        if ([0, 6].includes(day.getDay())) continue;
        for (const hour of [11, 14]) {
          const start = new Date(day);
          start.setHours(hour, 0, 0, 0);
          docs.push({
            counselor: user._id,
            startAt: start,
            endAt: new Date(start.getTime() + 45 * 60000),
            location: profile.officeLocation,
            capacity: 1
          });
        }
        added += 1;
      }
      await Slot.insertMany(docs);
      logger.info(`Added ${docs.length} demo slots for ${c.name}`);
    }
  }

  await mongoose.disconnect();
  logger.info('Counselor seeding complete.');
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Counselor seeding failed: ${err.message}`);
  process.exit(1);
});
