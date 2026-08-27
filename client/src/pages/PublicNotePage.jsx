import React, { useState, useEffect } from 'react';
import { useParams } from 'react';
import { Lock, Eye, Flag, ShieldAlert, Check } from 'lucide-react';
import api from '../services/api';

const PublicNotePage = () => {
  const { shareLink } = useParams();
  const [note, setNote] = useState(null);
  const [password, setPassword] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const fetchPublicNote = async (pass = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/shares/public/${shareLink}`, { password: pass });
      setNote(res.data.note);
      setIsProtected(false);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.isProtected) {
        setIsProtected(true);
      } else {
        setError(err.response?.data?.message || 'Public note not found or link expired.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicNote();
  }, [shareLink]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    fetchPublicNote(password);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shares/report', {
        noteId: note._id,
        reason: reportReason,
        details: reportDetails,
      });
      setReportSent(true);
      setTimeout(() => {
        setReportModal(false);
        setReportSent(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (isProtected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Password Protected Note</h2>
          <p className="text-xs text-slate-500">This note requires a password to view.</p>

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-xl outline-none"
            />
            <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700">
              Unlock Note
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Note Unavailable</h2>
          <p className="text-xs text-slate-500">{error || 'Note link expired or disabled.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-10 space-y-6">
        {/* Public Note Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-md uppercase tracking-wider">
              Public NoteFlow Shared Note
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">{note.title}</h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Author: {note.createdBy?.name || 'Anonymous'}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {note.viewCount} views</span>
            </p>
          </div>

          <button
            onClick={() => setReportModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl transition"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </div>

        {/* Note Content Body */}
        <div
          className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      </div>

      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Report Note</h3>

            {reportSent ? (
              <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Report submitted to administrators.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  >
                    <option value="Spam">Spam</option>
                    <option value="Abuse">Abuse</option>
                    <option value="Copyright">Copyright Violation</option>
                    <option value="Inappropriate content">Inappropriate Content</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Additional Details</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe the issue..."
                    className="w-full p-3 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setReportModal(false)} className="flex-1 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-800 rounded-xl">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl">
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicNotePage;
