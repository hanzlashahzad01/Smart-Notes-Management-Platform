import React, { useEffect, useState } from 'react';
import {
  FileText, Star, Pin, Archive, Trash2, Calendar, Sparkles,
  ArrowRight, Clock, TrendingUp, Zap, FolderOpen, Plus, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NoteContext';
import NoteCard from '../components/notes/NoteCard';
import api from '../services/api';

const Dashboard = ({ onOpenNote, onShareNote }) => {
  const { user } = useAuth();
  const { stats, notes, categories } = useNotes();
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    api.get('/reminders')
      .then((res) => setReminders(res.data.reminders || []))
      .catch(() => {});
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statCards = [
    {
      label: 'Total Notes',
      count: stats.totalNotes || 0,
      icon: FileText,
      gradient: 'from-indigo-500 via-indigo-600 to-purple-600',
      badge: 'Hub',
      glow: 'shadow-indigo-500/20',
    },
    {
      label: 'Favorites',
      count: stats.favorites || 0,
      icon: Star,
      gradient: 'from-amber-400 via-orange-500 to-amber-600',
      badge: 'Starred',
      glow: 'shadow-amber-500/20',
    },
    {
      label: 'Pinned',
      count: stats.pinned || 0,
      icon: Pin,
      gradient: 'from-emerald-400 via-teal-500 to-emerald-600',
      badge: 'Priority',
      glow: 'shadow-emerald-500/20',
    },
    {
      label: 'Archived',
      count: stats.archived || 0,
      icon: Archive,
      gradient: 'from-sky-400 via-blue-500 to-cyan-600',
      badge: 'Stored',
      glow: 'shadow-sky-500/20',
    },
    {
      label: 'Trash',
      count: stats.trash || 0,
      icon: Trash2,
      gradient: 'from-rose-500 via-pink-600 to-rose-700',
      badge: 'Trash',
      glow: 'shadow-rose-500/20',
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-8 pb-10 max-w-full">

      {/* Hero Welcome Banner */}
      <div className="welcome-banner rounded-2xl sm:rounded-3xl p-4 sm:p-10 text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] sm:text-xs font-bold text-white/95 border border-white/20 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>NoteFlow Studio v2.4</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </div>

            <button
              onClick={() => onOpenNote(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>New Note</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-2 sm:mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {getGreeting()},<br />
            <span className="bg-gradient-to-r from-white via-indigo-100 to-pink-200 bg-clip-text text-transparent">{user?.name || 'Creator'}</span>
            <span className="ml-2 text-2xl sm:text-4xl inline-block">👋</span>
          </h1>

          <p className="text-xs sm:text-base text-white/80 max-w-2xl leading-relaxed mb-4 sm:mb-6 font-normal">
            Organize thoughts with real-time AI assistance, tags, and smart folders in one workspace.
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-6 text-xs font-semibold text-white/80">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
              <FileText className="w-3.5 h-3.5 text-indigo-300" />
              <span>{stats.totalNotes || 0} Notes</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
              <Star className="w-3.5 h-3.5 text-amber-300" />
              <span>{stats.favorites || 0} Favorites</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              <span>Real-time Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="glass-panel-luxury glass-card-hover p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between gap-2.5 relative overflow-hidden cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className={`w-8.5 h-8.5 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md ${card.glow}`}>
                  <Icon className="w-4 h-4 sm:w-5.5 sm:h-5.5 text-white" strokeWidth={2.2} />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-md">
                  {card.badge}
                </span>
              </div>
              <div>
                <p className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 leading-none tabular-nums tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {card.count}
                </p>
                <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid Layout: Recent Notes & Right Column */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">

        {/* Left Column: Recent Notes */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <Clock className="w-4.5 h-4.5 text-indigo-500" />
                Recent Notes
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Your latest edited ideas</p>
            </div>
            <a
              href="/notes"
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors group"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {notes.slice(0, 6).length === 0 ? (
              <div className="sm:col-span-2 flex flex-col items-center justify-center py-12 text-center glass-panel-luxury rounded-2xl p-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6 text-indigo-500" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No notes created yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-0.5">Create your first note to get started.</p>
                <button
                  onClick={() => onOpenNote(null)}
                  className="mt-3 btn-primary px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Note</span>
                </button>
              </div>
            ) : (
              notes.slice(0, 6).map((note) => (
                <NoteCard key={note._id} note={note} onEdit={onOpenNote} onShare={onShareNote} />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Folders, Reminders, AI Box */}
        <div className="space-y-4 sm:space-y-5">

          {/* Folders Breakdown */}
          <div className="glass-panel-luxury rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <FolderOpen className="w-4 h-4 text-indigo-500" />
                Folders Breakdown
              </h3>
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{categories.length} Folders</span>
            </div>

            <div className="space-y-3">
              {categories.map((cat) => {
                const total = stats.totalNotes || 1;
                const pct = Math.round(((cat.noteCount || 0) / total) * 100);
                return (
                  <div key={cat._id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color || '#6366F1' }}
                        />
                        <span className="text-slate-700 dark:text-slate-300 font-bold truncate max-w-[150px]">{cat.name}</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 tabular-nums text-[11px]">{cat.noteCount || 0} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ backgroundColor: cat.color || '#6366F1', width: `${Math.max(6, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Reminders Widget */}
          <div className="glass-panel-luxury rounded-2xl p-4 sm:p-5 shadow-xs">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              <Calendar className="w-4 h-4 text-indigo-500" />
              Scheduled Reminders
            </h3>

            {reminders.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1">No upcoming reminders set.</p>
            ) : (
              <div className="space-y-2">
                {reminders.slice(0, 4).map((r) => (
                  <div
                    key={r._id}
                    className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {r.noteId?.title || 'Untitled Note'}
                      </p>
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(r.remindAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Feature Spotlight */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-300" />
              </div>
              <h3 className="text-xs sm:text-sm font-black tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>AI Intelligence Suite</h3>
            </div>
            <p className="text-xs text-white/85 leading-relaxed font-normal mb-2.5">
              Generate summaries, rewrite notes, and ask questions with AI.
            </p>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-md w-fit">
              <ShieldCheck className="w-3 h-3" />
              <span>Socket Connected</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
