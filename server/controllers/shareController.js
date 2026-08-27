const Note = require('../models/Note');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const Report = require('../models/Report');
const { sendShareNotificationEmail } = require('../utils/mailer');
const crypto = require('crypto');

// @route POST /api/shares/share
const shareNoteWithUser = async (req, res, next) => {
  try {
    const { noteId, email, permission } = req.body;

    if (!noteId || !email) {
      return res.status(400).json({ message: 'Note ID and recipient email are required' });
    }

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only the note owner can share this note' });
    }

    const recipient = await User.findOne({ email: email.toLowerCase() });
    if (!recipient) {
      return res.status(404).json({ message: 'User with this email was not found' });
    }

    if (recipient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot share a note with yourself' });
    }

    // Check if already shared
    const existingIndex = note.sharedWith.findIndex(s => s.user.toString() === recipient._id.toString());
    const validPerm = permission === 'EDITOR' ? 'EDITOR' : 'VIEWER';

    if (existingIndex > -1) {
      note.sharedWith[existingIndex].permission = validPerm;
    } else {
      note.sharedWith.push({ user: recipient._id, permission: validPerm });
    }

    await note.save();

    // In-app Notification
    const notification = await Notification.create({
      userId: recipient._id,
      title: '🤝 Note Shared With You',
      message: `${req.user.name} shared "${note.title}" with you as ${validPerm}`,
      type: 'SHARE',
      link: `/notes/${note._id}`,
    });

    // Send async email notification
    sendShareNotificationEmail(recipient.email, req.user.name, note.title, validPerm).catch(console.error);

    await Activity.create({
      userId: req.user._id,
      noteId: note._id,
      action: 'SHARE',
      description: `Shared note "${note.title}" with ${recipient.email} (${validPerm})`,
    });

    const updatedNote = await Note.findById(note._id).populate('sharedWith.user', 'name email avatar');

    res.status(200).json({ message: 'Note shared successfully', note: updatedNote, notification });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/shares/unshare
const removeShareAccess = async (req, res, next) => {
  try {
    const { noteId, userId } = req.body;
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only the note owner can revoke sharing permissions' });
    }

    note.sharedWith = note.sharedWith.filter(s => s.user.toString() !== userId);
    await note.save();

    res.status(200).json({ message: 'User share permission revoked', noteId });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/shares/public-link
const updatePublicShare = async (req, res, next) => {
  try {
    const { noteId, isPublic, password, expiresAt } = req.body;
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to change public share settings' });
    }

    if (isPublic) {
      const shareLink = note.publicShare.shareLink || crypto.randomBytes(12).toString('hex');
      note.publicShare = {
        isPublic: true,
        shareLink,
        password: password || '',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      };
    } else {
      note.publicShare.isPublic = false;
    }

    await note.save();
    res.status(200).json({ message: 'Public share settings updated', publicShare: note.publicShare });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/shares/public/:shareLink
const getPublicNote = async (req, res, next) => {
  try {
    const { shareLink } = req.params;
    const { password } = req.body;

    const note = await Note.findOne({ 'publicShare.shareLink': shareLink, 'publicShare.isPublic': true })
      .populate('createdBy', 'name avatar')
      .populate('category tags');

    if (!note) {
      return res.status(404).json({ message: 'Public note not found or link disabled' });
    }

    if (note.publicShare.expiresAt && new Date() > note.publicShare.expiresAt) {
      return res.status(410).json({ message: 'This public share link has expired' });
    }

    if (note.publicShare.password && note.publicShare.password !== password) {
      return res.status(401).json({ message: 'Password required or incorrect password', isProtected: true });
    }

    note.viewCount += 1;
    await note.save();

    res.status(200).json({ note });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/shares/report
const reportNote = async (req, res, next) => {
  try {
    const { noteId, reason, details } = req.body;
    if (!noteId || !reason) {
      return res.status(400).json({ message: 'Note ID and reason are required' });
    }

    const report = await Report.create({
      noteId,
      reportedBy: req.user._id,
      reason,
      details: details || '',
    });

    res.status(201).json({ message: 'Report submitted for administrator review', report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  shareNoteWithUser,
  removeShareAccess,
  updatePublicShare,
  getPublicNote,
  reportNote,
};
