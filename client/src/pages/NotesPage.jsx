import React, { useState } from 'react';
import { LayoutGrid, List, Filter, FileText, Plus, ArrowUpDown, Sparkles } from 'lucide-react';
import { useNotes } from '../context/NoteContext';
import NoteCard from '../components/notes/NoteCard';

const titleMap = {
  all:      'All Notes',
  favorites: 'Starred Favorites ⭐',
  pinned:   'Pinned Notes 📌',
  archived: 'Archived Storage 📁',
  trash:    'Recycle Bin 🗑️',
};

const NotesPage = ({ onOpenNote, onShareNote, onNewNote }) => {
  const { notes, filter, loading, selectedPriority, setSelectedPriority } = useNotes();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === 'title-asc')   { setSortBy('title'); setSortOrder('asc'); }
    else if (val === 'title-desc') { setSortBy('title'); setSortOrder('desc'); }
    else if (val === 'createdAt')  { setSortBy('createdAt'); setSortOrder('desc'); }
    else if (val === 'viewCount')  { setSortBy('viewCount'); setSortOrder('desc'); }
    else                           { setSortBy('updatedAt'); setSortOrder('desc'); }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 max-w-full">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1
            className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {titleMap[filter] || 'Notes Workspace'}
            <span className="text-[11px] sm:text-xs font-black px-2.5 py-0.5 sm:py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 tabular-nums">
              {notes.length} Notes
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize and filter your ideas in real-time.
          </p>
        </div>

        {/* Action Bar Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">

          {/* Sort Dropdown */}
          <div className="flex-1 sm:flex-none flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl bg-white/80 dark:bg-[#0c1226]/80 border border-slate-200/80 dark:border-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs max-w-[48%] sm:max-w-none">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <select
              onChange={handleSortChange}
              className="bg-transparent outline-none cursor-pointer text-slate-700 dark:text-slate-300 font-semibold w-full text-[11px] sm:text-xs"
            >
              <option value="updatedAt" className="bg-white dark:bg-[#0c1226]">Updated</option>
              <option value="createdAt" className="bg-white dark:bg-[#0c1226]">Created</option>
              <option value="title-asc" className="bg-white dark:bg-[#0c1226]">Title A → Z</option>
              <option value="title-desc" className="bg-white dark:bg-[#0c1226]">Title Z → A</option>
              <option value="viewCount" className="bg-white dark:bg-[#0c1226]">Most Viewed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex-1 sm:flex-none flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl bg-white/80 dark:bg-[#0c1226]/80 border border-slate-200/80 dark:border-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs max-w-[48%] sm:max-w-none">
            <Filter className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <select
              value={selectedPriority || ''}
              onChange={(e) => setSelectedPriority(e.target.value || null)}
              className="bg-transparent outline-none cursor-pointer text-slate-700 dark:text-slate-300 font-semibold w-full text-[11px] sm:text-xs"
            >
              <option value="" className="bg-white dark:bg-[#0c1226]">All Priorities</option>
              <option value="HIGH" className="bg-white dark:bg-[#0c1226]">High</option>
              <option value="MEDIUM" className="bg-white dark:bg-[#0c1226]">Medium</option>
              <option value="LOW" className="bg-white dark:bg-[#0c1226]">Low</option>
            </select>
          </div>

          {/* View Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-700/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#0c1226] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#0c1226] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New Note Button */}
          <button
            onClick={onNewNote}
            className="btn-primary flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all ml-auto sm:ml-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Notes Container */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-200/80 dark:bg-slate-800/60 border border-slate-300/40 dark:border-slate-700/40" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center glass-panel-luxury rounded-3xl p-5 border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-3">
            <Sparkles className="w-7 h-7 text-indigo-500" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            No notes found in workspace
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 mb-4">
            Create a note or adjust search filters to display items.
          </p>
          <button
            onClick={onNewNote}
            className="btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Note Now</span>
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4' : 'flex flex-col gap-3'}>
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} onEdit={onOpenNote} onShare={onShareNote} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesPage;
