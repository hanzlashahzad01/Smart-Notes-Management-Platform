const Note = require('../models/Note');
const Category = require('../models/Category');
const Tag = require('../models/Tag');

// @route GET /api/data/export
const exportUserData = async (req, res, next) => {
  try {
    const { format = 'json' } = req.query;
    const userId = req.user._id;

    const notes = await Note.find({ createdBy: userId, isTrashed: false })
      .populate('category tags')
      .lean();
    const categories = await Category.find({ createdBy: userId }).lean();
    const tags = await Tag.find({ createdBy: userId }).lean();

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=noteflow_backup_${Date.now()}.json`);
      return res.status(200).send(JSON.stringify({ notes, categories, tags, exportedAt: new Date() }, null, 2));
    }

    if (format === 'markdown' || format === 'md') {
      const mdContent = notes
        .map(
          n => `# ${n.title}\n\n*Created: ${new Date(n.createdAt).toLocaleDateString()} | Category: ${n.category ? n.category.name : 'Uncategorized'}*\n\n${n.plainText || n.content}\n\n---\n`
        )
        .join('\n');

      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename=noteflow_notes_${Date.now()}.md`);
      return res.status(200).send(mdContent);
    }

    // Default Plain Text format
    const txtContent = notes
      .map(n => `TITLE: ${n.title}\nDATE: ${n.createdAt}\n\n${n.plainText || n.content}\n\n========================================\n`)
      .join('\n');

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=noteflow_notes_${Date.now()}.txt`);
    res.status(200).send(txtContent);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/data/import
const importNotes = async (req, res, next) => {
  try {
    const { notesData, fileType } = req.body;

    if (!notesData) {
      return res.status(400).json({ message: 'No content data provided for import' });
    }

    let createdCount = 0;

    if (fileType === 'json') {
      const parsed = typeof notesData === 'string' ? JSON.parse(notesData) : notesData;
      const notesToImport = Array.isArray(parsed) ? parsed : parsed.notes || [];

      for (const item of notesToImport) {
        await Note.create({
          title: item.title || 'Imported Note',
          content: item.content || `<p>${item.plainText || ''}</p>`,
          plainText: item.plainText || item.content || '',
          createdBy: req.user._id,
        });
        createdCount++;
      }
    } else {
      // Markdown or TXT raw string import
      const sections = notesData.split(/(?:#+|\bTITLE:)/i).filter(s => s.trim().length > 0);

      for (const section of sections) {
        const lines = section.trim().split('\n');
        const title = lines[0].replace(/^#+|\bTITLE:/i, '').trim() || 'Imported Note';
        const body = lines.slice(1).join('<br/>').trim();

        await Note.create({
          title,
          content: `<p>${body || title}</p>`,
          plainText: body || title,
          createdBy: req.user._id,
        });
        createdCount++;
      }
    }

    res.status(200).json({ message: `Successfully imported ${createdCount} notes!`, count: createdCount });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportUserData,
  importNotes,
};
