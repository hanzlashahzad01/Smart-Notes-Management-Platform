const User = require('../models/User');
const Note = require('../models/Note');
const Report = require('../models/Report');
const Activity = require('../models/Activity');

// @route GET /api/admin/stats
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    const totalNotes = await Note.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'PENDING' });

    // Calculate system storage estimation
    const notesContentLength = await Note.aggregate([
      { $project: { length: { $strLenCP: { $ifNull: ['$content', ''] } } } },
      { $group: { _id: null, totalBytes: { $sum: '$length' } } },
    ]);

    const bytesUsed = notesContentLength[0] ? notesContentLength[0].totalBytes : 0;
    const storageUsedMB = (bytesUsed / (1024 * 1024)).toFixed(2);

    res.status(200).json({
      stats: {
        totalUsers,
        activeUsers,
        totalNotes,
        pendingReports,
        storageUsedMB,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    const usersWithNoteCount = await Promise.all(
      users.map(async (u) => {
        const noteCount = await Note.countDocuments({ createdBy: u._id });
        return {
          ...u.toObject(),
          noteCount,
        };
      })
    );

    res.status(200).json({ users: usersWithNoteCount, total });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/admin/users/:id/toggle-status
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = !user.isVerified;
    await user.save();

    res.status(200).json({ message: `User account ${user.isVerified ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/users/:id
const deleteUserAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Clean up user's data
    await Note.deleteMany({ createdBy: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'User account and associated notes deleted permanently' });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/admin/reports
const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'name email')
      .populate('noteId', 'title publicShare')
      .sort({ createdAt: -1 });

    res.status(200).json({ reports });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/admin/reports/:id
const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (status) report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;

    await report.save();

    res.status(200).json({ message: 'Report status updated', report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  toggleUserStatus,
  deleteUserAccount,
  getReports,
  updateReportStatus,
};
