const asyncHandler = require('express-async-handler');
const FAQ = require('../models/FAQ');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    List FAQs (optionally filtered by category or search)
// @route   GET /api/faqs
// @access  Public
const listFaqs = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const filter = { isPublished: true };
  if (category) filter.category = category;

  let query = FAQ.find(search ? { ...filter, $text: { $search: search } } : filter);
  const faqs = await query.sort({ createdAt: -1 }).lean();

  res.status(200).json(new ApiResponse(200, { faqs }));
});

// @desc    Create an FAQ entry
// @route   POST /api/faqs
// @access  Private (admin, agent)
const createFaq = asyncHandler(async (req, res) => {
  const { question, answer, category, tags } = req.body;
  if (!question || !answer) throw new ApiError(400, 'Question and answer are required.');

  const faq = await FAQ.create({
    question,
    answer,
    category: category || 'general',
    tags: tags || [],
    createdBy: req.user._id
  });

  res.status(201).json(new ApiResponse(201, { faq }, 'FAQ created.'));
});

// @desc    Update an FAQ entry
// @route   PUT /api/faqs/:id
// @access  Private (admin, agent)
const updateFaq = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  if (!faq) throw new ApiError(404, 'FAQ not found.');

  const { question, answer, category, tags, isPublished } = req.body;
  if (question !== undefined) faq.question = question;
  if (answer !== undefined) faq.answer = answer;
  if (category !== undefined) faq.category = category;
  if (tags !== undefined) faq.tags = tags;
  if (isPublished !== undefined) faq.isPublished = isPublished;

  await faq.save();
  res.status(200).json(new ApiResponse(200, { faq }, 'FAQ updated.'));
});

// @desc    Delete an FAQ entry
// @route   DELETE /api/faqs/:id
// @access  Private (admin)
const deleteFaq = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  if (!faq) throw new ApiError(404, 'FAQ not found.');
  await faq.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, 'FAQ deleted.'));
});

module.exports = { listFaqs, createFaq, updateFaq, deleteFaq };
