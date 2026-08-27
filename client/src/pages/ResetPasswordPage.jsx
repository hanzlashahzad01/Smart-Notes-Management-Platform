import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 space-y-6">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Set New Password</h1>
        <p className="text-xs text-slate-500">Create a new secure password for your NoteFlow account.</p>

        {message ? (
          <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-2xl text-center space-y-3">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
            <p>{message}</p>
            <a href="/login" className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl">
              Log In Now
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">{error}</div>}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
