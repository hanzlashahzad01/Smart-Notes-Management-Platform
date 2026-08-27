import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText, Star, Pin, Archive, Trash2, FolderPlus, Plus,
  BarChart3, Bell, Settings, Shield, Download, Hash, History, Home, X, Sparkles, HardDrive,
} from 'lucide-react';
import { useNotes } from '../../context/NoteContext';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ onOpenCategoryModal, onOpenTagModal, onOpenImportExport, isMobileMenuOpen, onCloseMobileMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    filter, setFilter, stats,
    categories, tags,
    selectedCategory, setSelectedCategory,
    selectedTag, setSelectedTag,
  } = useNotes();

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard', count: null },
    { id: 'all', label: 'All Notes', icon: FileText, href: '/notes', count: stats.totalNotes || 0 },
    { id: 'favorites', label: 'Favorites', icon: Star, href: null, count: stats.favorites || 0 },
    { id: 'pinned', label: 'Pinned', icon: Pin, href: null, count: stats.pinned || 0 },
    { id: 'archived', label: 'Archived', icon: Archive, href: null, count: stats.archived || 0 },
    { id: 'trash', label: 'Trash', icon: Trash2, href: null, count: stats.trash || 0 },
  ];

  const handleNavClick = (item) => {
    if (item.href) {
      navigate(item.href);
    } else {
      navigate('/notes');
    }
    setFilter(item.id === 'dashboard' ? 'all' : item.id);
    setSelectedCategory(null);
    setSelectedTag(null);
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  const isNavActive = (item) => {
    if (item.id === 'dashboard') return location.pathname === '/' || location.pathname === '/dashboard';
    return filter === item.id && !selectedCategory && !selectedTag && location.pathname === '/notes';
  };

  const SectionLabel = ({ children }) => (
    <p className="px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
      <span>{children}</span>
    </p>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/80 dark:bg-[#070b19]/90 border-r border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl transition-all duration-300">
      
      {/* Mobile Drawer Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span className="font-bold text-slate-900 dark:text-white">NoteFlow Menu</span>
        </div>
        <button
          onClick={onCloseMobileMenu}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">

        {/* Main Navigation */}
        <div className="space-y-1">
          <SectionLabel>Overview</SectionLabel>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group relative ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && item.count !== undefined && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-extrabold tabular-nums ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Category Folders */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-1">
            <SectionLabel>Folders</SectionLabel>
            <button
              onClick={() => { onOpenCategoryModal(); if (onCloseMobileMenu) onCloseMobileMenu(); }}
              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-all"
              title="New Folder"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat._id;
              return (
                <button
                  key={cat._id}
                  onClick={() => {
                    setSelectedCategory(isSelected ? null : cat._id);
                    setSelectedTag(null);
                    setFilter('all');
                    navigate('/notes');
                    if (onCloseMobileMenu) onCloseMobileMenu();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all group ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-slate-900 shadow-xs"
                      style={{ backgroundColor: cat.color || '#6366F1' }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold tabular-nums flex-shrink-0 ${
                    isSelected ? 'bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400'
                  }`}>
                    {cat.noteCount || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Smart Tags */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <SectionLabel>Smart Tags</SectionLabel>
            <button
              onClick={() => { onOpenTagModal(); if (onCloseMobileMenu) onCloseMobileMenu(); }}
              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-all"
              title="New Tag"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1 px-3">
            {tags.map((tg) => {
              const isSelected = selectedTag === tg._id;
              return (
                <button
                  key={tg._id}
                  onClick={() => {
                    setSelectedTag(isSelected ? null : tg._id);
                    setSelectedCategory(null);
                    setFilter('all');
                    navigate('/notes');
                    if (onCloseMobileMenu) onCloseMobileMenu();
                  }}
                  className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                      : 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200/50 dark:border-slate-700/40'
                  }`}
                >
                  <Hash className="w-3 h-3 opacity-60" />
                  <span>{tg.name.replace('#', '')}</span>
                  <span className="opacity-60">·{tg.usageCount || 0}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Storage Indicator Widget */}
      <div className="px-3 py-3 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-950 dark:text-indigo-200 mb-1.5">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
              <span>Storage Used</span>
            </div>
            <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">{stats.totalNotes || 0} / 500 Notes</span>
          </div>
          <div className="w-full h-1.5 bg-indigo-200/60 dark:bg-indigo-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(8, ((stats.totalNotes || 0) / 500) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer System Links */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80 p-3 space-y-0.5">
        {[
          { href: '/activity', icon: History, label: 'Activity History' },
          { href: '/analytics', icon: BarChart3, label: 'Analytics' },
          { href: '/reminders', icon: Bell, label: 'Reminders' },
          { href: '/settings', icon: Settings, label: 'Settings' },
        ].map(({ href, icon: Icon, label }) => (
          <a
            key={href}
            href={href}
            onClick={() => { if (onCloseMobileMenu) onCloseMobileMenu(); }}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              location.pathname === href
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 font-bold border border-indigo-200/60 dark:border-indigo-800/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </a>
        ))}

        <button
          onClick={() => { onOpenImportExport(); if (onCloseMobileMenu) onCloseMobileMenu(); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-all text-left"
        >
          <Download className="w-4 h-4" />
          <span>Import / Export</span>
        </button>

        {user?.role === 'ADMIN' && (
          <a
            href="/admin"
            onClick={() => { if (onCloseMobileMenu) onCloseMobileMenu(); }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all"
          >
            <Shield className="w-4 h-4" />
            <span>Admin Panel</span>
          </a>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Sticky 64px width) */}
      <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-hidden z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-over overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobileMenu}
          />
          {/* Sliding Sheet */}
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
