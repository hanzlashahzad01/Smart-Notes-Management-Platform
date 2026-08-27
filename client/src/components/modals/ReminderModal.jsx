import React, { useState } from 'react';
import { X, Bell, Calendar, Clock } from 'lucide-react';
import api from '../../services/api';

const ReminderModal = ({ note, isOpen, onClose }) => {
  const [remindAt, setRemindAt] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen || !note) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!remindAt) return;

    try {
      await api.post('/reminders', {
        noteId: note._id,
        remindAt,
        notifyTypes: { inApp: true, browser: true, email: notifyEmail },
      });
      setStatusMsg('Reminder set successfully! ⏰');
      setTimeout(() => {
        setStatusMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    }
  };

  const setPreset = (minutes) => {
    const d = new Date(Date.now() + minutes * 60 * 1000);
    const isoString = d.toISOString().slice(0, 16);
    setRemindAt(isoString);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Set Reminder</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl text-center">{statusMsg}</div>}

        <p className="text-xs text-slate-500">Scheduled alert for note: <strong>"{note.title}"</strong></p>

        {/* Quick Presets */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPreset(120)}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 rounded-xl"
          >
            In 2 Hours
          </button>
          <button
            type="button"
            onClick={() => setPreset(720)}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 rounded-xl"
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => setPreset(10080)}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 rounded-xl"
          >
            Next Week
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Date & Time</label>
            <input
              type="datetime-local"
              required
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-xl outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Send email notification alert</span>
          </label>

          <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700">
            Set Reminder
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;
