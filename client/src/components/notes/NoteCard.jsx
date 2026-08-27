import React from 'react';
import { Pin, Star, Trash2, Copy, Share2, Calendar, Hash, Sparkles } from 'lucide-react';
import { useNotes } from '../../context/NoteContext';

const priorityConfig = {
  HIGH:   { label: 'HIGH',   bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
  MEDIUM: { label: 'MEDIUM', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  LOW:    { label: 'LOW',    bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
};

const NoteCard = ({ note, onEdit, onShare }) => {
  const { updateNote, deleteNote, duplicateNote } = useNotes();

  const handleTogglePin = (e) => {
    e.stopPropagation();
    updateNote(note._id, { isPinned: !note.isPinned });
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    updateNote(note._id, { isFavorite: !note.isFavorite });
  };

  const pc = priorityConfig[note.priority] || priorityConfig.MEDIUM;
  const accentColor = note.category?.color || note.coverColor || '#6366f1';

  return (
    <div
      onClick={() => onEdit(note)}
      className="glass-panel-luxury glass-card-hover relative rounded-2xl cursor-pointer flex flex-col overflow-hidden group border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all duration-300"
      style={{ minHeight: '215px' }}
    >
      {/* Top Multi-Gradient Color Accent Bar */}
      <div
        className="h-1.5 w-full flex-shrink-0 transition-all duration-300 group-hover:h-2"
        style={{ background: `linear-gradient(90deg, ${accentColor}, #8b5cf6, #ec4899)` }}
      />

      <div className="flex flex-col flex-1 p-5">

        {/* Title Row */}
        <div className="flex items-start justify-between gap-2.5 mb-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {note.title || 'Untitled Note'}
          </h3>

          {/* Quick Action Toggles */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleTogglePin}
              className={`p-1.5 rounded-xl transition-all ${
                note.isPinned
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 shadow-xs'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
            >
              <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-xl transition-all ${
                note.isFavorite
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/80 shadow-xs'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={note.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
            >
              <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Snippet Preview */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed flex-1 mb-4 font-normal">
          {note.plainText || note.content?.replace(/<[^>]*>?/gm, '') || 'No additional content...'}
        </p>

        {/* Tags & Priority Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          {note.category && (
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg text-white shadow-xs"
              style={{ backgroundColor: note.category.color || '#6366f1' }}
            >
              {note.category.name}
            </span>
          )}
          {note.priority && (
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${pc.bg}`}>
              {pc.label}
            </span>
          )}
          {note.tags?.slice(0, 2).map((tg) => (
            <span
              key={tg._id}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-0.5"
            >
              <Hash className="w-3 h-3 opacity-60" />
              {tg.name.replace('#', '')}
            </span>
          ))}
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date(note.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>

          <div
            className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onShare(note)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Share Link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => duplicateNote(note._id)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Duplicate"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteNote(note._id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
              title="Delete Note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NoteCard;
