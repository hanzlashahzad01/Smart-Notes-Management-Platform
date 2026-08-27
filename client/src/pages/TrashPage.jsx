import React, { useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useNotes } from '../context/NoteContext';

const TrashPage = () => {
  const { notes, setFilter, restoreNote, permanentDeleteNote, fetchNotes } = useNotes();

  useEffect(() => {
    setFilter('trash');
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-500" />
          <span>Trash / Recycle Bin</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Items in the trash will be automatically purged after retention period (default 30 days).
        </p>
      </div>

      {/* Auto-Purge Banner */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <span>Notes here are kept temporarily. You can restore them anytime before automated background cleanup.</span>
      </div>

      {/* Trashed Notes Grid */}
      {notes.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
          <Trash2 className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Trash Bin is Empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div key={note._id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{note.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{note.plainText}</p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => restoreNote(note._id)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => permanentDeleteNote(note._id)}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrashPage;
