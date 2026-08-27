import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing email verification token.');
        return;
      }
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Email verification failed.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 text-center space-y-4">
        {status === 'verifying' ? (
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
        ) : status === 'success' ? (
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
        ) : (
          <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
        )}

        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          {status === 'success' ? 'Email Verified 🎉' : 'Verification Status'}
        </h1>
        <p className="text-xs text-slate-500">{message}</p>

        <a
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700 transition mt-4"
        >
          <span>Continue to Login</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
