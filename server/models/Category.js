const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '#6366F1' }, // Default Indigo hex
    icon: { type: String, default: 'Folder' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
