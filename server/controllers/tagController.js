const Tag = require('../models/Tag');
const Note = require('../models/Note');

// @route POST /api/tags
const createTag = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Tag name is required' });

    const tagName = name.trim().startsWith('#') ? name.trim() : `#${name.trim()}`;

    const existing = await Tag.findOne({ name: tagName, createdBy: req.user._id });
    if (existing) return res.status(400).json({ message: 'Tag already exists', tag: existing });

    const tag = await Tag.create({
      name: tagName,
      color: color || '#3B82F6',
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Tag created successfully', tag });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/tags
const getTags = async (req, res, next) => {
  try {
    let tags = await Tag.find({ createdBy: req.user._id }).sort({ name: 1 });

    // Seed defaults if empty
    if (tags.length === 0) {
      const defaultTags = [
        { name: '#mern', color: '#6366F1' },
        { name: '#react', color: '#3B82F6' },
        { name: '#javascript', color: '#F59E0B' },
        { name: '#university', color: '#10B981' },
        { name: '#project', color: '#8B5CF6' },
      ];
      await Tag.insertMany(defaultTags.map(t => ({ ...t, createdBy: req.user._id })));
      tags = await Tag.find({ createdBy: req.user._id }).sort({ name: 1 });
    }

    const tagsWithUsage = await Promise.all(
      tags.map(async (tag) => {
        const usageCount = await Note.countDocuments({ tags: tag._id, isTrashed: false });
        return {
          ...tag.toObject(),
          usageCount,
        };
      })
    );

    res.status(200).json({ tags: tagsWithUsage });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/tags/:id
const updateTag = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const tag = await Tag.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    if (name) {
      tag.name = name.trim().startsWith('#') ? name.trim() : `#${name.trim()}`;
    }
    if (color) tag.color = color;

    await tag.save();
    res.status(200).json({ message: 'Tag updated successfully', tag });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/tags/:id
const deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    await Note.updateMany({ tags: req.params.id }, { $pull: { tags: req.params.id } });

    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTag,
  getTags,
  updateTag,
  deleteTag,
};
