const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      enum: ['Spam', 'Abuse', 'Copyright', 'Inappropriate content', 'Other'],
      required: true,
    },
    details: { type: String, default: '' },
    status: { type: String, enum: ['PENDING', 'REVIEWED', 'RESOLVED', 'REJECTED'], default: 'PENDING' },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
