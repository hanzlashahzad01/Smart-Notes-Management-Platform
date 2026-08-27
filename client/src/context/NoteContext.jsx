import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, favorites, pinned, archived, trash
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [stats, setStats] = useState({ totalNotes: 0, favorites: 0, pinned: 0, archived: 0, trash: 0 });
  
  // Auto Save status: 'idle', 'typing', 'saving', 'saved'
  const [saveStatus, setSaveStatus] = useState('saved');

  // Draft recovery state
  const [activeDraft, setActiveDraft] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  }, [user]);

  const fetchTags = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/tags');
      setTags(res.data.tags || []);
    } catch (err) {
      console.error('Fetch tags error:', err);
    }
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notes/dashboard/stats');
      setStats(res.data.stats || {});
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, [user]);

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = {
        filter,
        search: searchQuery,
        category: selectedCategory,
        tag: selectedTag,
        priority: selectedPriority,
      };
      const res = await api.get('/notes', { params });
      setNotes(res.data.notes || []);
    } catch (err) {
      console.error('Fetch notes error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, filter, searchQuery, selectedCategory, selectedTag, selectedPriority]);

  useEffect(() => {
    if (user) {
      fetchNotes();
      fetchCategories();
      fetchTags();
      fetchStats();
    }
  }, [user, fetchNotes, fetchCategories, fetchTags, fetchStats]);

  // Draft Recovery Check on Mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('noteflow_unsaved_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setActiveDraft(parsed);
      } catch (e) {
        localStorage.removeItem('noteflow_unsaved_draft');
      }
    }
  }, []);

  const createNote = async (noteData) => {
    const res = await api.post('/notes', noteData);
    setNotes((prev) => [res.data.note, ...prev]);
    fetchStats();
    return res.data.note;
  };

  const updateNote = async (id, noteData) => {
    setSaveStatus('saving');
    try {
      const res = await api.put(`/notes/${id}`, noteData);
      setNotes((prev) => prev.map((n) => (n._id === id ? res.data.note : n)));
      setSaveStatus('saved');
      return res.data.note;
    } catch (err) {
      setSaveStatus('idle');
      throw err;
    }
  };

  const deleteNote = async (id) => {
    await api.delete(`/notes/${id}`);
    setNotes((prev) => prev.filter((n) => n._id !== id));
    fetchStats();
  };

  const restoreNote = async (id) => {
    await api.patch(`/notes/${id}/restore`);
    fetchNotes();
    fetchStats();
  };

  const permanentDeleteNote = async (id) => {
    await api.delete(`/notes/${id}/permanent`);
    setNotes((prev) => prev.filter((n) => n._id !== id));
    fetchStats();
  };

  const duplicateNote = async (id) => {
    const res = await api.post(`/notes/${id}/duplicate`);
    setNotes((prev) => [res.data.note, ...prev]);
    fetchStats();
    return res.data.note;
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        categories,
        tags,
        stats,
        loading,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedTag,
        setSelectedTag,
        selectedPriority,
        setSelectedPriority,
        saveStatus,
        setSaveStatus,
        activeDraft,
        setActiveDraft,
        fetchNotes,
        fetchCategories,
        fetchTags,
        createNote,
        updateNote,
        deleteNote,
        restoreNote,
        permanentDeleteNote,
        duplicateNote,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => useContext(NoteContext);
