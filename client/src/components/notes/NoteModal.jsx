import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Share2,
  Bell,
  Check,
  Loader2,
  Folder,
  Tag as TagIcon,
  Palette,
  Flag,
  Copy,
  Trash2,
  Bot,
  Paperclip,
  Upload,
  Download,
  Users,
} from 'lucide-react';
import TipTapEditor from '../editor/TipTapEditor';
import { useNotes } from '../../context/NoteContext';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const NoteModal = ({ note, isOpen, onClose, onShareNote, onSetReminder }) => {
  const { updateNote, createNote, categories, tags, fetchNotes } = useNotes();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverColor, setCoverColor] = useState('#FFFFFF');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [priority, setPriority] = useState('MEDIUM');
  const [attachments, setAttachments] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [collaboratorStatus, setCollaboratorStatus] = useState('');
  const [saveState, setSaveState] = useState('Saved ✓');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [showAiMenu, setShowAiMenu] = useState(false);

  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setCoverColor(note.coverColor || '#FFFFFF');
      setSelectedCategory(note.category ? note.category._id || note.category : '');
      setSelectedTags(note.tags ? note.tags.map((t) => (t._id ? t._id : t)) : []);
      setPriority(note.priority || 'MEDIUM');
      setAttachments(note.attachments || []);
      setSaveState('Saved ✓');

      // Socket live collaboration join
      if (socket && note._id) {
        socket.emit('join_note', { noteId: note._id, userName: user?.name });

        socket.on('note_editing_status', ({ userName, isEditing }) => {
          if (isEditing) {
            setCollaboratorStatus(`${userName} is editing...`);
          } else {
            setCollaboratorStatus('');
          }
        });
      }
    } else {
      setTitle('');
      setContent('');
      setCoverColor('#FFFFFF');
      setSelectedCategory('');
      setSelectedTags([]);
      setPriority('MEDIUM');
      setAttachments([]);
      setSaveState('Draft');
    }

    return () => {
      if (socket && note?._id) {
        socket.emit('leave_note', { noteId: note._id, userName: user?.name });
        socket.off('note_editing_status');
      }
    };
  }, [note, isOpen, socket, user]);

  if (!isOpen) return null;

  // File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !note?._id) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('noteId', note._id);

    setIsUploadingFile(true);
    try {
      const res = await api.post('/attachments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAttachments((prev) => [...prev, res.data.attachment]);
    } catch (err) {
      alert(err.response?.data?.message || 'File upload failed');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteAttachment = async (id) => {
    try {
      await api.delete(`/attachments/${id}`);
      setAttachments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-Save Handler with debouncing
  const handleAutoSave = (newTitle, newContent, newCategory, newTags, newPriority, newCover) => {
    setSaveState('Typing...');

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveState('Saving...');
      try {
        if (note && note._id) {
          await updateNote(note._id, {
            title: newTitle,
            content: newContent,
            category: newCategory || null,
            tags: newTags,
            priority: newPriority,
            coverColor: newCover,
          });
        } else {
          await createNote({
            title: newTitle || 'Untitled Note',
            content: newContent,
            category: newCategory || null,
            tags: newTags,
            priority: newPriority,
            coverColor: newCover,
          });
        }
        setSaveState('Saved ✓');
        localStorage.removeItem('noteflow_unsaved_draft');
      } catch (err) {
        setSaveState('Error saving');
      }
    }, 1200);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    handleAutoSave(val, content, selectedCategory, selectedTags, priority, coverColor);
  };

  const handleContentChange = (html) => {
    setContent(html);
    handleAutoSave(title, html, selectedCategory, selectedTags, priority, coverColor);
  };

  // AI Actions
  const handleAiSummarize = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.post('/ai/summarize', { content });
      setAiResponse(res.data.summary);
    } catch (err) {
      setAiResponse('Failed to generate summary.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiRewrite = async (mode) => {
    setIsAiLoading(true);
    try {
      const res = await api.post('/ai/rewrite', { content, mode });
      setContent(res.data.content);
      handleAutoSave(title, res.data.content, selectedCategory, selectedTags, priority, coverColor);
      setAiResponse('Note content rewritten successfully!');
    } catch (err) {
      setAiResponse('Failed to rewrite note.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiAsk = async () => {
    if (!aiQuestion) return;
    setIsAiLoading(true);
    try {
      const res = await api.post('/ai/ask', { content, question: aiQuestion });
      setAiResponse(res.data.answer);
    } catch (err) {
      setAiResponse('Error asking AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const colors = ['#FFFFFF', '#FEF2F2', '#FFFBEB', '#ECFDF5', '#EFF6FF', '#F5F3FF', '#FDF2F8'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-1.5 sm:p-4 overflow-y-auto animate-in fade-in">
      <div
        className="w-full max-w-4xl bg-white/95 dark:bg-[#070b19]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh] transition-colors"
        style={{ borderTop: coverColor !== '#FFFFFF' ? `5px solid ${coverColor}` : undefined }}
      >
        {/* Modal Top Bar */}
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          {/* Auto-Save Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
              <span
                className={`w-2 h-2 rounded-full ${
                  saveState === 'Saved ✓'
                    ? 'bg-emerald-500'
                    : saveState === 'Saving...'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-indigo-500'
                }`}
              />
              <span>{saveState}</span>
            </div>

            {collaboratorStatus && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-lg animate-pulse">
                <Users className="w-3 h-3" />
                <span>{collaboratorStatus}</span>
              </span>
            )}
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* AI Suite Button */}
            <button
              onClick={() => setShowAiMenu(!showAiMenu)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl transition border border-indigo-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Suite</span>
            </button>

            {note && (
              <>
                <button
                  onClick={() => onSetReminder(note)}
                  className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition"
                  title="Set Reminder"
                >
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => onShareNote(note)}
                  className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition"
                  title="Share Note"
                >
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition"
            >
              <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* AI Suite Dropdown Box */}
        {showAiMenu && (
          <div className="p-3 sm:p-4 bg-indigo-500/10 border-b border-indigo-500/20 space-y-2.5 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                <Bot className="w-4 h-4 text-indigo-500" />
                <span>NoteFlow AI Studio</span>
              </div>
              <button onClick={() => setShowAiMenu(false)} className="text-slate-400 hover:text-slate-600 text-xs">
                Close
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={handleAiSummarize}
                disabled={isAiLoading}
                className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl shadow-xs"
              >
                Summarize
              </button>
              <button
                onClick={() => handleAiRewrite('professional')}
                disabled={isAiLoading}
                className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl"
              >
                Professional Tone
              </button>
              <button
                onClick={() => handleAiRewrite('shorter')}
                disabled={isAiLoading}
                className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl"
              >
                Make Shorter
              </button>
            </div>

            {/* Ask AI Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask AI about this note..."
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
              />
              <button
                onClick={handleAiAsk}
                disabled={isAiLoading}
                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
              >
                Ask
              </button>
            </div>

            {isAiLoading && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>AI processing note...</span>
              </div>
            )}

            {aiResponse && (
              <div className="p-3 bg-white dark:bg-[#0c1226] border border-indigo-200 dark:border-indigo-800/80 rounded-xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono whitespace-pre-line">
                {aiResponse}
              </div>
            )}
          </div>
        )}

        {/* Modal Main Content Workspace */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-7 space-y-4 sm:space-y-5">
          {/* Note Title Input */}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Note Title..."
            className="w-full text-xl sm:text-3xl font-black bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-700"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          />

          {/* Properties Bar (Category, Tags, Priority, Cover) */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 py-2 border-y border-slate-200/60 dark:border-slate-800/80 text-[11px] sm:text-xs">
            {/* Category Selector */}
            <div className="flex items-center gap-1 text-slate-500">
              <Folder className="w-3.5 h-3.5 text-indigo-500" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  handleAutoSave(title, content, e.target.value, selectedTags, priority, coverColor);
                }}
                className="bg-transparent outline-none font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-slate-900">Folder...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id} className="bg-white dark:bg-slate-900">
                    📁 {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selector */}
            <div className="flex items-center gap-1 text-slate-500">
              <Flag className="w-3.5 h-3.5 text-amber-500" />
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  handleAutoSave(title, content, selectedCategory, selectedTags, e.target.value, coverColor);
                }}
                className="bg-transparent outline-none font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="LOW" className="bg-white dark:bg-slate-900">Low Priority</option>
                <option value="MEDIUM" className="bg-white dark:bg-slate-900">Med Priority</option>
                <option value="HIGH" className="bg-white dark:bg-slate-900">High Priority</option>
              </select>
            </div>

            {/* Cover Color Accent Picker */}
            <div className="flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex items-center gap-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCoverColor(c);
                      handleAutoSave(title, content, selectedCategory, selectedTags, priority, c);
                    }}
                    className={`w-3.5 h-3.5 rounded-full border ${
                      coverColor === c ? 'ring-2 ring-indigo-500' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* TipTap Editor */}
          <TipTapEditor content={content} onChange={handleContentChange} />

          {/* File Attachments Section */}
          {note?._id && (
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Attachments ({attachments.length})
                  </h4>
                </div>

                <label className="cursor-pointer flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-500/20 transition">
                  <Upload className="w-3 h-3" />
                  <span>{isUploadingFile ? 'Uploading...' : 'Attach'}</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((att) => (
                    <div
                      key={att._id}
                      className="p-2.5 bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate text-xs">{att.originalName}</p>
                        <p className="text-[10px] text-slate-400">{(att.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={att.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-lg"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteAttachment(att._id)}
                          className="p-1 text-rose-500 hover:bg-rose-100 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
