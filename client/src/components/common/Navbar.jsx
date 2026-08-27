import React, { useState } from 'react';
import {
  Search, Bell, Sun, Moon, Monitor, Command, Plus, LogOut, Shield, Settings, FileText, Zap, Menu, X, Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotes } from '../../context/NoteContext';
import { useSocket } from '../../context/SocketContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ onOpenCommandPalette, onNewNote, onOpenTemplates, isMobileMenuOpen, onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { searchQuery, setSearchQuery } = useNotes();
  const { unreadCount } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-14 sm:h-16 flex items-center justify-between px-2.5 sm:px-6 lg:px-8 flex-shrink-0 bg-white/80 dark:bg-[#070b19]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-all duration-300">

      {/* Brand Logo & Mobile Sidebar Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          title="Toggle Navigation"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-indigo-500" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.href = '/'}>
          <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
            <Zap className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white animate-pulse" strokeWidth={2.5} />
          </div>
          <div className="hidden xs:block sm:block">
            <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Note<span className="gradient-text-indigo">Flow</span>
            </span>
          </div>
        </div>
      </div>

      {/* Search Input Bar (Desktop & Tablet) */}
      <div className="hidden sm:flex flex-1 max-w-xl mx-3 sm:mx-6">
        <div className="relative w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
          <input
            id="global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, categories, tags... (Ctrl + K)"
            className="w-full pl-10 pr-24 py-2 text-xs sm:text-sm bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/60 dark:focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100"
          />
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-1 absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg hover:border-indigo-500/40 transition-colors shadow-xs"
          >
            <Command className="w-3 h-3" />
            <span>K</span>
          </button>
        </div>
      </div>

      {/* Mobile Compact Search Toggle */}
      {showMobileSearch ? (
        <div className="sm:hidden flex-1 mx-2 relative">
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-indigo-500/50 rounded-lg text-slate-900 dark:text-slate-100 outline-none"
          />
          <button
            onClick={() => setShowMobileSearch(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}

      {/* Action Controls */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

        {/* Mobile Search Button */}
        {!showMobileSearch && (
          <button
            onClick={() => setShowMobileSearch(true)}
            className="sm:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Templates Button */}
        <button
          onClick={onOpenTemplates}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 rounded-xl transition"
        >
          <FileText className="w-4 h-4 text-indigo-500" />
          <span>Templates</span>
        </button>

        {/* New Note Button */}
        <button
          onClick={onNewNote}
          id="new-note-btn"
          className="btn-primary flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">New Note</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 sm:p-2.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 rounded-xl transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[9px] sm:text-[10px] font-black text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => {
            if (theme === 'light') setTheme('dark');
            else if (theme === 'dark') setTheme('system');
            else setTheme('light');
          }}
          className="p-1.5 sm:p-2.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 rounded-xl transition-all"
          title={`Theme: ${theme}`}
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-indigo-400" />
          ) : theme === 'light' ? (
            <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500" />
          ) : (
            <Monitor className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400" />
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 p-0.5 sm:p-1 rounded-xl hover:ring-2 hover:ring-indigo-500/40 transition-all"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-xl object-cover ring-2 ring-indigo-500/50 shadow-sm" />
            ) : (
              <div className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white font-black text-xs flex items-center justify-center ring-2 ring-indigo-500/40 shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white/95 dark:bg-[#0c1226]/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/90 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{user?.email}</p>
                <span className="inline-block mt-2 text-[10px] font-black px-2.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-500/20 uppercase tracking-wider">
                  {user?.role || 'Member'}
                </span>
              </div>

              <a
                href="/settings"
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Account Settings</span>
              </a>

              {user?.role === 'ADMIN' && (
                <a
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/60 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </a>
              )}

              <div className="border-t border-slate-100 dark:border-slate-800/80 mt-1 pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
