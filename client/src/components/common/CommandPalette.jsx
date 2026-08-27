import React, { useState, useEffect } from 'react';
import { Search, Plus, Star, Pin, Trash2, Moon, Sun, Download, X } from 'lucide-react';
import { useNotes } from '../../context/NoteContext';
import { useTheme } from '../../context/ThemeContext';

const CommandPalette = ({ isOpen, onClose, onNewNote, onOpenImportExport }) => {
  const [query, setQuery] = useState('');
  const { setFilter } = useNotes();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        onNewNote();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNewNote]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'create',
      label: 'Create New Note',
      shortcut: 'Ctrl + N',
      icon: Plus,
      run: () => {
        onNewNote();
        onClose(false);
      },
    },
    {
      id: 'fav',
      label: 'Go to Starred Favorites',
      icon: Star,
      run: () => {
        setFilter('favorites');
        onClose(false);
      },
    },
    {
      id: 'pinned',
      label: 'Go to Pinned Notes',
      icon: Pin,
      run: () => {
        setFilter('pinned');
        onClose(false);
      },
    },
    {
      id: 'trash',
      label: 'Open Recycle Bin',
      icon: Trash2,
      run: () => {
        setFilter('trash');
        onClose(false);
      },
    },
    {
      id: 'theme',
      label: `Switch Theme (Current: ${theme})`,
      icon: theme === 'dark' ? Sun : Moon,
      run: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        onClose(false);
      },
    },
    {
      id: 'export',
      label: 'Import / Export Notes Data',
      icon: Download,
      run: () => {
        onOpenImportExport();
        onClose(false);
      },
    },
  ];

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in">
      <div className="w-full max-w-xl bg-white/95 dark:bg-[#070b19]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden">
        {/* Input header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search action..."
            className="w-full bg-transparent outline-none text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <button
            onClick={() => onClose(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filteredActions.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400 font-medium">No matching commands found.</p>
          ) : (
            filteredActions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={act.run}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-indigo-500/10 text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {act.label}
                    </span>
                  </div>
                  {act.shortcut && (
                    <span className="text-[10px] font-mono font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-md">
                      {act.shortcut}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
