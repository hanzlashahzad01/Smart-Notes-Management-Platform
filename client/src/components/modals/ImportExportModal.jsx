import React, { useState } from 'react';
import { X, Download, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useNotes } from '../../context/NoteContext';

const ImportExportModal = ({ isOpen, onClose }) => {
  const { fetchNotes } = useNotes();
  const [importData, setImportData] = useState('');
  const [importFileType, setImportFileType] = useState('json');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleExport = (format) => {
    window.open(`/api/data/export?format=${format}`, '_blank');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.json')) setImportFileType('json');
    else if (fileName.endsWith('.md')) setImportFileType('markdown');
    else setImportFileType('txt');

    const reader = new FileReader();
    reader.onload = (event) => {
      setImportData(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importData) return;

    setStatusMsg('');
    setErrorMsg('');

    try {
      const res = await api.post('/data/import', {
        notesData: importData,
        fileType: importFileType,
      });
      setStatusMsg(res.data.message);
      setImportData('');
      fetchNotes();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to import notes');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Backup & Import Notes Data</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl">{statusMsg}</div>}
        {errorMsg && <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">{errorMsg}</div>}

        {/* Export Data Section */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Export Your Notes</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleExport('json')}
              className="px-3 py-2.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl hover:shadow-md transition"
            >
              JSON Archive
            </button>
            <button
              onClick={() => handleExport('markdown')}
              className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl hover:shadow-md transition"
            >
              Markdown (.md)
            </button>
            <button
              onClick={() => handleExport('txt')}
              className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl hover:shadow-md transition"
            >
              Plain Text (.txt)
            </button>
          </div>
        </div>

        {/* Import Notes Section */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Import Notes from File</label>

          <input
            type="file"
            accept=".json,.md,.txt,.csv"
            onChange={handleFileUpload}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />

          {importData && (
            <form onSubmit={handleImportSubmit} className="space-y-3">
              <textarea
                rows={4}
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Import preview..."
                className="w-full p-3 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
              <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700">
                Import Notes
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExportModal;
