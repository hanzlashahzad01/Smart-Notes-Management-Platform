import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Request processed. Please check your email inbox.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 space-y-6">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Forgot Password</h1>
        <p className="text-xs text-slate-500">Enter your account email to receive a password reset link.</p>

        {message && <div className="p-3 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-xl">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <a href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </a>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
