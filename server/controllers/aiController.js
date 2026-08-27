const { summarizeNoteContent, generateNoteContent, rewriteNoteContent, askNoteAI } = require('../services/aiService');
const Note = require('../models/Note');

// @route POST /api/ai/summarize
const summarizeNote = async (req, res, next) => {
  try {
    const { noteId, content } = req.body;
    let targetContent = content;

    if (noteId) {
      const note = await Note.findById(noteId);
      if (note) targetContent = note.content;
    }

    if (!targetContent) {
      return res.status(400).json({ message: 'Content or valid noteId required' });
    }

    const summary = await summarizeNoteContent(targetContent);
    res.status(200).json({ summary });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/ai/generate
const generateNote = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    const content = await generateNoteContent(prompt);
    res.status(200).json({ content });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/ai/rewrite
const rewriteNote = async (req, res, next) => {
  try {
    const { content, mode } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const rewritten = await rewriteNoteContent(content, mode || 'professional');
    res.status(200).json({ content: rewritten });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/ai/ask
const askNote = async (req, res, next) => {
  try {
    const { noteId, content, question } = req.body;
    let targetContent = content;

    if (noteId) {
      const note = await Note.findById(noteId);
      if (note) targetContent = note.content;
    }

    if (!question) return res.status(400).json({ message: 'Question is required' });

    const answer = await askNoteAI(targetContent || '', question);
    res.status(200).json({ answer });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  summarizeNote,
  generateNote,
  rewriteNote,
  askNote,
};
