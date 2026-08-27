import React, { useState } from 'react';
import { X, Tag as TagIcon } from 'lucide-react';
import { useNotes } from '../../context/NoteContext';
import api from '../../services/api';

const TagModal = ({ isOpen, onClose }) => {
  const { fetchTags } = useNotes();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    try {
      await api.post('/tags', { name, color });
      fetchTags();
      setName('');
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Create Smart Tag</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tag Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. #react, #mern, #javascript..."
              className="w-full px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-xl outline-none"
            />
          </div>

          <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700">
            Create Tag
          </button>
        </form>
      </div>
    </div>
  );
};

export default TagModal;
