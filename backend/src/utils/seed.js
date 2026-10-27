require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const FAQ = require('../models/FAQ');
const logger = require('./logger');

const faqs = [
  {
    question: 'How do I apply for financial aid?',
    answer:
      'Complete the FAFSA (or your institution\'s aid application) as early as possible after it opens. Submit any requested tax documents to the Financial Aid Office and check your student portal for your award letter within 4-6 weeks.',
    category: 'financial-aid',
    tags: ['fafsa', 'aid', 'scholarship']
  },
  {
    question: 'How do I reset my student portal password?',
    answer:
      'Go to the student portal login page and click "Forgot password." Enter your university email to receive a reset link. If you do not receive it within 10 minutes, contact IT Help Desk to verify your account.',
    category: 'technical',
    tags: ['password', 'login', 'it-help-desk']
  },
  {
    question: 'What is the add/drop deadline for courses?',
    answer:
      'The add/drop period typically runs during the first two weeks of the semester. Check the academic calendar on the registrar\'s site for exact dates, since deadlines vary by term and course format.',
    category: 'academics',
    tags: ['registration', 'deadline', 'courses']
  },
  {
    question: 'How do I apply for on-campus housing?',
    answer:
      'Submit the housing application through the Residence Life portal along with the deposit. Room assignments are typically released about a month before the semester starts, prioritized by application date.',
    category: 'housing',
    tags: ['dorm', 'residence', 'application']
  },
  {
    question: 'Where can I get free mental health support on campus?',
    answer:
      'The Student Counseling Center offers free confidential sessions for enrolled students. You can book online through the wellness portal or call the center directly; same-day crisis appointments are available.',
    category: 'wellness',
    tags: ['counseling', 'mental-health', 'wellness']
  },
  {
    question: 'How do I check my admission application status?',
    answer:
      'Log into the applicant portal with the credentials from your confirmation email. Status updates (under review, decision released, etc.) appear on your dashboard, usually within 24 hours of any change.',
    category: 'admissions',
    tags: ['application', 'status', 'decision']
  }
];

const run = async () => {
  await connectDB();

  const adminEmail = 'admin@campus.edu';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'System Administrator',
      email: adminEmail,
      password: 'Admin@12345',
      role: 'admin'
    });
    logger.info(`Created default admin user: ${adminEmail} / Admin@12345`);
  } else {
    logger.info('Admin user already exists, skipping.');
  }

  for (const faq of faqs) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await FAQ.findOne({ question: faq.question });
    if (!exists) {
      // eslint-disable-next-line no-await-in-loop
      await FAQ.create(faq);
    }
  }
  logger.info(`Seeded ${faqs.length} FAQ entries (existing ones skipped).`);

  await mongoose.disconnect();
  logger.info('Seeding complete.');
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Seeding failed: ${err.message}`);
  process.exit(1);
});
