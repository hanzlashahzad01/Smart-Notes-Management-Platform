const Reminder = require('../models/Reminder');
const Note = require('../models/Note');

// @route POST /api/reminders
const createReminder = async (req, res, next) => {
  try {
    const { noteId, remindAt, notifyTypes } = req.body;

    if (!noteId || !remindAt) {
      return res.status(400).json({ message: 'Note ID and scheduled reminder date are required' });
    }

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Clear previous pending reminders for this note/user if any
    await Reminder.deleteMany({ noteId, userId: req.user._id, isCompleted: false });

    const reminder = await Reminder.create({
      noteId,
      userId: req.user._id,
      remindAt: new Date(remindAt),
      notifyTypes: notifyTypes || { inApp: true, browser: true, email: false },
    });

    const populated = await Reminder.findById(reminder._id).populate('noteId', 'title category priority');

    res.status(201).json({ message: 'Reminder set successfully', reminder: populated });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/reminders
const getReminders = async (req, res, next) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id })
      .populate('noteId', 'title category priority isTrashed')
      .sort({ remindAt: 1 });

    const activeReminders = reminders.filter(r => r.noteId && !r.noteId.isTrashed);

    res.status(200).json({ reminders: activeReminders });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/reminders/:id
const deleteReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });

    res.status(200).json({ message: 'Reminder canceled successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReminder,
  getReminders,
  deleteReminder,
};
