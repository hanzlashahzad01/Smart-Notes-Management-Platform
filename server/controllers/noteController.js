const Note = require('../models/Note');
const Activity = require('../models/Activity');
const Category = require('../models/Category');
const Tag = require('../models/Tag');

// Helper to seed initial sample notes for a seamless experience
const seedDemoNotesIfEmpty = async (userId) => {
  const count = await Note.countDocuments({ createdBy: userId });
  if (count > 0) return;

  const categories = await Category.find({ createdBy: userId });
  const tags = await Tag.find({ createdBy: userId });

  const getCatId = (name) => categories.find((c) => c.name.toLowerCase() === name.toLowerCase())?._id || null;
  const getTagIds = (names) => tags.filter((t) => names.includes(t.name.toLowerCase())).map((t) => t._id);

  const sampleNotes = [
    {
      title: '📌 Important Project Requirements',
      content: `<h1>📌 NoteFlow SaaS System Requirements</h1>
<p>Complete full-stack architecture specifications for NoteFlow application:</p>
<h3>Core Technology Stack</h3>
<ul>
  <li><strong>Backend:</strong> Node.js, Express.js, MongoDB (Mongoose), Socket.IO</li>
  <li><strong>Frontend:</strong> React.js, Vite, Tailwind CSS, TipTap Editor</li>
  <li><strong>Background Automation:</strong> Cron Scheduler & Reminder Engine</li>
</ul>
<h3>Key Milestones</h3>
<ul class="task-list">
  <li>[x] Multi-device JWT authentication & sessions</li>
  <li>[x] Rich text TipTap editor integration</li>
  <li>[x] AI Summarize, Rewrite & Ask Note Assistant</li>
</ul>`,
      plainText: 'Complete full-stack architecture specifications for NoteFlow application. Tech stack: Node.js, Express, MongoDB, Socket.IO, React, Vite, TipTap.',
      coverColor: '#EFF6FF',
      category: getCatId('Projects'),
      tags: getTagIds(['#mern', '#project']),
      priority: 'HIGH',
      isPinned: true,
      isFavorite: true,
      createdBy: userId,
    },
    {
      title: '📌 Database Credentials & Setup',
      content: `<h1>📌 MongoDB Atlas & Local Setup</h1>
<p>Configuration details for database cluster and local testing environment:</p>
<pre><code>// Local Connection String
MONGO_URI=mongodb://127.0.0.1:27017/noteflow

// Production Atlas Mongo Cluster
MONGO_URI=mongodb+srv://admin:securepass@cluster0.noteflow.mongodb.net/noteflow</code></pre>`,
      plainText: 'Configuration details for database cluster and local testing environment: MONGO_URI=mongodb://127.0.0.1:27017/noteflow',
      coverColor: '#ECFDF5',
      category: getCatId('Programming'),
      tags: getTagIds(['#javascript', '#mern']),
      priority: 'HIGH',
      isPinned: true,
      createdBy: userId,
    },
    {
      title: '📌 Interview Preparation Guide',
      content: `<h1>🎯 Full-Stack Developer Technical Interview Notes</h1>
<h3>1. React Concepts & Hooks</h3>
<p>Understand <code>useState</code>, <code>useEffect</code>, <code>useCallback</code>, <code>useMemo</code>, and custom context state management.</p>
<h3>2. Node & System Design</h3>
<p>Discuss JWT token rotation in HTTP-Only cookies, rate limiting, and Socket.IO real-time event loops.</p>`,
      plainText: 'Full-Stack Developer Technical Interview Notes. Understand React Hooks, custom context, JWT token rotation, rate limiting, Socket.IO.',
      coverColor: '#FFFBEB',
      category: getCatId('University'),
      tags: getTagIds(['#react', '#university']),
      priority: 'MEDIUM',
      isPinned: true,
      createdBy: userId,
    },
    {
      title: '⭐ MERN Authentication Cheatsheet',
      content: `<h1>🔐 MERN Authentication & Security</h1>
<p>Security best practices implemented in NoteFlow:</p>
<ul>
  <li>Bcrypt password hashing with salt rounds</li>
  <li>HTTP-Only cookie transport for Refresh Tokens</li>
  <li>Helmet security headers & XSS sanitization</li>
</ul>`,
      plainText: 'Security best practices implemented in NoteFlow: Bcrypt hashing, HTTP-Only cookies, Helmet headers, XSS sanitization.',
      coverColor: '#F5F3FF',
      category: getCatId('Programming'),
      tags: getTagIds(['#mern', '#javascript']),
      priority: 'HIGH',
      isFavorite: true,
      createdBy: userId,
    },
    {
      title: '💡 Smart AI Assistant Brainstorming',
      content: `<h1>🧠 AI Capabilities in NoteFlow</h1>
<p>Integrating artificial intelligence helper features directly into note workspace:</p>
<blockquote style="border-left: 4px solid #6366f1; padding-left: 12px;">
  "Empower users to automatically summarize long lecture notes, generate structured code outlines, and ask questions about document content."
</blockquote>`,
      plainText: 'Integrating artificial intelligence helper features directly into note workspace: Summarize, Generate, Rewrite, Ask AI.',
      coverColor: '#FDF2F8',
      category: getCatId('Ideas'),
      tags: getTagIds(['#project']),
      priority: 'MEDIUM',
      createdBy: userId,
    },
  ];

  await Note.insertMany(sampleNotes);
};

// Extract plain text helper for searching
const extractPlainText = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

// @route POST /api/notes
const createNote = async (req, res, next) => {
  try {
    const { title, content, coverColor, category, tags, priority, isFavorite, isPinned } = req.body;

    const plainText = extractPlainText(content || '');

    const note = await Note.create({
      title: title || 'Untitled Note',
      content: content || '',
      plainText,
      coverColor: coverColor || '#FFFFFF',
      category: category || null,
      tags: tags || [],
      priority: priority || 'MEDIUM',
      isFavorite: !!isFavorite,
      isPinned: !!isPinned,
      createdBy: req.user._id,
    });

    await Activity.create({
      userId: req.user._id,
      noteId: note._id,
      action: 'CREATE',
      description: `Created note "${note.title}"`,
    });

    const populatedNote = await Note.findById(note._id).populate('category tags attachments');

    res.status(201).json({ message: 'Note created successfully', note: populatedNote });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/notes
const getNotes = async (req, res, next) => {
  try {
    // Seed initial sample notes if user has none
    await seedDemoNotesIfEmpty(req.user._id);
    const {
      page = 1,
      limit = 20,
      search,
      filter = 'all', // all, favorites, pinned, archived, trash
      category,
      tag,
      priority,
      hasAttachment,
      hasReminder,
      sortBy = 'updatedAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // Filter by tab state
    if (filter === 'trash') {
      query.isTrashed = true;
      query.createdBy = req.user._id;
    } else {
      query.isTrashed = false;
      query.$or = [
        { createdBy: req.user._id },
        { 'sharedWith.user': req.user._id },
      ];

      if (filter === 'favorites') query.isFavorite = true;
      if (filter === 'pinned') query.isPinned = true;
      if (filter === 'archived') query.isArchived = true;
      if (filter === 'all') query.isArchived = false;
    }

    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (priority) query.priority = priority;

    if (hasAttachment === 'true') {
      query['attachments.0'] = { $exists: true };
    }

    // Search query
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: searchRegex },
          { plainText: searchRegex },
        ],
      });
    }

    const sortOptions = {};
    if (sortBy === 'title') sortOptions.title = order === 'asc' ? 1 : -1;
    else if (sortBy === 'createdAt') sortOptions.createdAt = order === 'asc' ? 1 : -1;
    else if (sortBy === 'viewCount') sortOptions.viewCount = -1;
    else sortOptions.updatedAt = order === 'asc' ? 1 : -1;

    // Always sort pinned notes to top when default listing
    const finalSort = filter === 'pinned' || sortBy !== 'updatedAt' 
      ? sortOptions 
      : { isPinned: -1, ...sortOptions };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notes = await Note.find(query)
      .populate('category tags attachments createdBy', 'name email avatar color icon')
      .sort(finalSort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);

    res.status(200).json({
      notes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/notes/:id
const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('category tags attachments')
      .populate('createdBy', 'name email avatar')
      .populate('sharedWith.user', 'name email avatar');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Verify ownership or shared permission
    const isOwner = note.createdBy._id.toString() === req.user._id.toString();
    const isShared = note.sharedWith.some(s => s.user._id.toString() === req.user._id.toString());

    if (!isOwner && !isShared && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view this note' });
    }

    note.viewCount += 1;
    note.lastOpenedAt = new Date();
    await note.save();

    res.status(200).json({ note });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/notes/:id
const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const isOwner = note.createdBy.toString() === req.user._id.toString();
    const sharedItem = note.sharedWith.find(s => s.user.toString() === req.user._id.toString());
    const isEditor = sharedItem && sharedItem.permission === 'EDITOR';

    if (!isOwner && !isEditor && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You do not have permission to edit this note' });
    }

    const { title, content, coverColor, category, tags, priority, isFavorite, isPinned, isArchived } = req.body;

    if (title !== undefined) note.title = title;
    if (content !== undefined) {
      note.content = content;
      note.plainText = extractPlainText(content);
    }
    if (coverColor !== undefined) note.coverColor = coverColor;
    if (category !== undefined) note.category = category || null;
    if (tags !== undefined) note.tags = tags;
    if (priority !== undefined) note.priority = priority;
    if (isFavorite !== undefined) note.isFavorite = isFavorite;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (isArchived !== undefined) note.isArchived = isArchived;

    note.version += 1;
    await note.save();

    await Activity.create({
      userId: req.user._id,
      noteId: note._id,
      action: 'UPDATE',
      description: `Updated note "${note.title}"`,
    });

    const updatedNote = await Note.findById(note._id).populate('category tags attachments createdBy', 'name email avatar color icon');

    res.status(200).json({ message: 'Note updated successfully', note: updatedNote });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/notes/:id (Move to Trash)
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only the note owner can delete this note' });
    }

    note.isTrashed = true;
    note.trashedAt = new Date();
    await note.save();

    await Activity.create({
      userId: req.user._id,
      noteId: note._id,
      action: 'DELETE',
      description: `Moved note "${note.title}" to Trash`,
    });

    res.status(200).json({ message: 'Note moved to Trash', noteId: note._id });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/notes/:id/restore
const restoreNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.isTrashed = false;
    note.trashedAt = null;
    await note.save();

    await Activity.create({
      userId: req.user._id,
      noteId: note._id,
      action: 'RESTORE',
      description: `Restored note "${note.title}" from Trash`,
    });

    res.status(200).json({ message: 'Note restored successfully', note });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/notes/:id/permanent
const permanentDeleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to permanently delete this note' });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Note permanently deleted', noteId: req.params.id });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/notes/:id/duplicate
const duplicateNote = async (req, res, next) => {
  try {
    const sourceNote = await Note.findById(req.params.id);
    if (!sourceNote) return res.status(404).json({ message: 'Original note not found' });

    const newNote = await Note.create({
      title: `${sourceNote.title} (Copy)`,
      content: sourceNote.content,
      plainText: sourceNote.plainText,
      coverColor: sourceNote.coverColor,
      category: sourceNote.category,
      tags: sourceNote.tags,
      priority: sourceNote.priority,
      createdBy: req.user._id,
    });

    const populatedNote = await Note.findById(newNote._id).populate('category tags attachments');

    res.status(201).json({ message: 'Note duplicated successfully', note: populatedNote });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/notes/dashboard/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totalNotes, favorites, pinned, archived, trash] = await Promise.all([
      Note.countDocuments({ createdBy: userId, isTrashed: false, isArchived: false }),
      Note.countDocuments({ createdBy: userId, isTrashed: false, isFavorite: true }),
      Note.countDocuments({ createdBy: userId, isTrashed: false, isPinned: true }),
      Note.countDocuments({ createdBy: userId, isTrashed: false, isArchived: true }),
      Note.countDocuments({ createdBy: userId, isTrashed: true }),
    ]);

    const recentNotes = await Note.find({ createdBy: userId, isTrashed: false })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('category tags');

    const categories = await Category.find({ createdBy: userId });
    const categoryCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Note.countDocuments({ createdBy: userId, category: cat._id, isTrashed: false });
        return { _id: cat._id, name: cat.name, color: cat.color, icon: cat.icon, count };
      })
    );

    res.status(200).json({
      stats: { totalNotes, favorites, pinned, archived, trash },
      recentNotes,
      categoryCounts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  restoreNote,
  permanentDeleteNote,
  duplicateNote,
  getDashboardStats,
};
