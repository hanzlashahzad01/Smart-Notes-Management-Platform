const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, default: 'Untitled Note' },
    content: { type: String, default: '' }, // HTML or JSON string
    plainText: { type: String, default: '' }, // Searchable text string
    coverColor: { type: String, default: '#FFFFFF' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }],
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    isFavorite: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    trashedAt: { type: Date, default: null },
    isPinned: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        permission: { type: String, enum: ['VIEWER', 'EDITOR'], default: 'VIEWER' },
        sharedAt: { type: Date, default: Date.now },
      },
    ],
    publicShare: {
      isPublic: { type: Boolean, default: false },
      shareLink: { type: String, default: '' },
      password: { type: String, default: '' },
      expiresAt: { type: Date, default: null },
    },
    version: { type: Number, default: 1 },
    viewCount: { type: Number, default: 0 },
    lastOpenedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for fast debounced search and filtering
noteSchema.index({ title: 'text', plainText: 'text' });
noteSchema.index({ createdBy: 1, isTrashed: 1, isArchived: 1, isPinned: 1, isFavorite: 1 });
noteSchema.index({ category: 1 });
noteSchema.index({ tags: 1 });

module.exports = mongoose.model('Note', noteSchema);
