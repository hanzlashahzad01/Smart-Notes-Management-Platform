const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Attachment = require('../models/Attachment');
const Note = require('../models/Note');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, Images, DOC/DOCX, TXT, ZIP'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

// @route POST /api/attachments/upload
const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { noteId } = req.body;
    if (!noteId) {
      return res.status(400).json({ message: 'Note ID is required for attachment upload' });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const attachment = await Attachment.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      fileUrl,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
      noteId,
    });

    note.attachments.push(attachment._id);
    await note.save();

    res.status(201).json({ message: 'File attached successfully', attachment });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/attachments/:id
const deleteAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Remove reference from Note
    await Note.findByIdAndUpdate(attachment.noteId, { $pull: { attachments: attachment._id } });

    // Delete file from disk
    const filePath = path.join(uploadDir, attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Attachment.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  uploadAttachment,
  deleteAttachment,
};
