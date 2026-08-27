import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Lock, Monitor, Shield, LogOut, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState('');
  const [passMsg, setPassMsg] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/auth/sessions');
        setSessions(res.data.sessions || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSessions();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, avatar });
      setMsg('Profile details updated!');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPassMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPassMsg(''), 2000);
    } catch (err) {
      setPassMsg(err.response?.data?.message || 'Password update failed');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await api.post('/auth/logout-all');
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-500" />
          <span>Account & Security Settings</span>
        </h1>
      </div>

      {/* Profile Settings */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" /> Profile Information
        </h3>

        {msg && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl">{msg}</div>}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2 text-xs bg-slate-200 dark:bg-slate-800/50 text-slate-500 rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Profile Picture URL</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            />
          </div>

          <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700">
            Save Profile
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-rose-500" /> Security & Password
        </h3>

        {passMsg && <div className="p-3 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-xl">{passMsg}</div>}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            />
          </div>

          <button type="submit" className="px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700">
            Change Password
          </button>
        </form>
      </div>

      {/* Active Sessions */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" /> Active Logged-in Sessions
          </h3>
          <button
            onClick={handleLogoutAll}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout All Devices
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sessions.map((s) => (
            <div key={s._id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">{s.device}</p>
                <p className="text-[10px] text-slate-400">IP: {s.ip}</p>
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
