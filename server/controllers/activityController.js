const Activity = require('../models/Activity');

// @route GET /api/activities
const getActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const activities = await Activity.find({ userId: req.user._id })
      .populate('noteId', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments({ userId: req.user._id });

    res.status(200).json({ activities, total });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivities };
