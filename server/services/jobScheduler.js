const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const Note = require('../models/Note');
const Notification = require('../models/Notification');
const Session = require('../models/Session');
const { sendReminderEmail } = require('../utils/mailer');

const initBackgroundJobs = (io) => {
  console.log('[Background Scheduler Initialized]');

  // Run every minute: Reminder Dispatcher
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const dueReminders = await Reminder.find({
        remindAt: { $lte: now },
        isCompleted: false,
      }).populate('noteId userId');

      for (const reminder of dueReminders) {
        if (!reminder.userId || !reminder.noteId) continue;

        // 1. Create In-App Notification
        const notification = await Notification.create({
          userId: reminder.userId._id,
          title: '⏰ Note Reminder',
          message: `Reminder for note: "${reminder.noteId.title}"`,
          type: 'REMINDER',
          link: `/notes/${reminder.noteId._id}`,
        });

        // 2. Emit Socket IO Real-time Notification if user is connected
        if (io) {
          io.to(reminder.userId._id.toString()).emit('notification', notification);
          io.to(reminder.userId._id.toString()).emit('reminder_due', {
            reminderId: reminder._id,
            noteTitle: reminder.noteId.title,
            noteId: reminder.noteId._id,
          });
        }

        // 3. Send Email if user enabled email reminders
        if (reminder.notifyTypes && reminder.notifyTypes.email && reminder.userId.email) {
          await sendReminderEmail(reminder.userId.email, reminder.noteId.title, reminder.remindAt);
        }

        // Mark as completed
        reminder.isCompleted = true;
        await reminder.save();
      }
    } catch (err) {
      console.error('[Reminder Job Error]:', err.message);
    }
  });

  // Run Daily at 2:00 AM: Trash Auto-Purge & Expired Sessions Cleanup
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('[Cron Job]: Running daily cleanup...');
      
      // 1. Purge notes trashed over 30 days ago
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const purged = await Note.deleteMany({
        isTrashed: true,
        trashedAt: { $lte: thirtyDaysAgo },
      });
      console.log(`[Cron Job]: Permanently deleted ${purged.deletedCount} expired trashed notes.`);

      // 2. Clear expired sessions
      const expiredSessions = await Session.deleteMany({ expiresAt: { $lt: new Date() } });
      console.log(`[Cron Job]: Cleaned ${expiredSessions.deletedCount} expired sessions.`);
    } catch (err) {
      console.error('[Cleanup Job Error]:', err.message);
    }
  });
};

module.exports = initBackgroundJobs;
