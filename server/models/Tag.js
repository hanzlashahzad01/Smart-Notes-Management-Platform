const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '#3B82F6' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

tagSchema.index({ name: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model('Tag', tagSchema);
