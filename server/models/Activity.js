const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', default: null },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'ARCHIVE', 'UNARCHIVE', 'PIN', 'UNPIN', 'FAVORITE', 'UNFAVORITE', 'SHARE'],
      required: true,
    },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
