const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    remindAt: { type: Date, required: true },
    isCompleted: { type: Boolean, default: false },
    notifyTypes: {
      inApp: { type: Boolean, default: true },
      browser: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);
