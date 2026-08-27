const Category = require('../models/Category');
const Note = require('../models/Note');

// @route POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, color, icon, parentCategory } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const existing = await Category.findOne({ name: name.trim(), createdBy: req.user._id });
    if (existing) return res.status(400).json({ message: 'Category with this name already exists' });

    const category = await Category.create({
      name: name.trim(),
      color: color || '#6366F1',
      icon: icon || 'Folder',
      parentCategory: parentCategory || null,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({ createdBy: req.user._id }).sort({ name: 1 });

    // Seed defaults if empty
    if (categories.length === 0) {
      const defaults = [
        { name: 'Work', color: '#6366F1', icon: 'Briefcase' },
        { name: 'University', color: '#3B82F6', icon: 'GraduationCap' },
        { name: 'Projects', color: '#10B981', icon: 'Folder' },
        { name: 'Personal', color: '#F59E0B', icon: 'User' },
        { name: 'Programming', color: '#8B5CF6', icon: 'Code' },
        { name: 'Ideas', color: '#EC4899', icon: 'Lightbulb' },
      ];
      await Category.insertMany(defaults.map(d => ({ ...d, createdBy: req.user._id })));
      categories = await Category.find({ createdBy: req.user._id }).sort({ name: 1 });
    }

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const noteCount = await Note.countDocuments({ category: cat._id, isTrashed: false });
        return {
          ...cat.toObject(),
          noteCount,
        };
      })
    );

    res.status(200).json({ categories: categoriesWithCount });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const { name, color, icon, parentCategory } = req.body;
    const category = await Category.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (name) category.name = name.trim();
    if (color) category.color = color;
    if (icon) category.icon = icon;
    if (parentCategory !== undefined) category.parentCategory = parentCategory || null;

    await category.save();

    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Unset category reference in associated notes
    await Note.updateMany({ category: req.params.id }, { $set: { category: null } });

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
