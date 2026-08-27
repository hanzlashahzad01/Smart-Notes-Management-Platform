import React, { useState } from 'react';
import { X, Send, Lock, Globe, Copy, Check, Trash2, Shield } from 'lucide-react';
import api from '../../services/api';

const ShareModal = ({ note, isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('VIEWER');
  const [isPublic, setIsPublic] = useState(note?.publicShare?.isPublic || false);
  const [password, setPassword] = useState(note?.publicShare?.password || '');
  const [shareLink, setShareLink] = useState(note?.publicShare?.shareLink || '');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !note) return null;

  const handleShareUser = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');
    try {
      await api.post('/shares/share', { noteId: note._id, email, permission });
      setStatusMsg(`Invited ${email} as ${permission}!`);
      setEmail('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to share note');
    }
  };

  const handleTogglePublic = async (publicState) => {
    setIsPublic(publicState);
    try {
      const res = await api.post('/shares/public-link', {
        noteId: note._id,
        isPublic: publicState,
        password,
      });
      setShareLink(res.data.publicShare.shareLink);
      setStatusMsg(publicState ? 'Public link generated!' : 'Public access disabled');
    } catch (err) {
      setErrorMsg('Failed to update public share settings');
    }
  };

  const fullShareUrl = `${window.location.origin}/share/${shareLink}`;

  const copyLink = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Share Note: "{note.title}"</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl">{statusMsg}</div>}
        {errorMsg && <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">{errorMsg}</div>}

        {/* Invite User by Email */}
        <form onSubmit={handleShareUser} className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Invite User</label>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="flex-1 px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-xl outline-none"
            />
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 font-semibold rounded-xl outline-none"
            >
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
            </select>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700">
              Invite
            </button>
          </div>
        </form>

        {/* Public Share Link Settings */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Public Link Access</span>
            </div>
            <button
              onClick={() => handleTogglePublic(!isPublic)}
              className={`w-11 h-6 rounded-full transition p-1 ${isPublic ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition transform ${isPublic ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {isPublic && (
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={fullShareUrl}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
                <button
                  onClick={copyLink}
                  className="px-3 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Optional access password..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
                <button
                  onClick={() => handleTogglePublic(true)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 font-semibold text-xs rounded-xl"
                >
                  Save Lock
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
