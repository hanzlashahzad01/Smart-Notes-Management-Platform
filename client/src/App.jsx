import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { NoteProvider } from './context/NoteContext';

import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import CommandPalette from './components/common/CommandPalette';
import NoteModal from './components/notes/NoteModal';
import ShareModal from './components/modals/ShareModal';
import ReminderModal from './components/modals/ReminderModal';
import CategoryModal from './components/modals/CategoryModal';
import TagModal from './components/modals/TagModal';
import TemplateModal from './components/modals/TemplateModal';
import ImportExportModal from './components/modals/ImportExportModal';

import ActivityPage from './pages/ActivityPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import NotesPage from './pages/NotesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RemindersPage from './pages/RemindersPage';
import TrashPage from './pages/TrashPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import PublicNotePage from './pages/PublicNotePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  const [activeNote, setActiveNote] = useState(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [shareNote, setShareNote] = useState(null);
  const [reminderNote, setReminderNote] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070b19]">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/20 animate-pulse mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wide animate-pulse">Loading NoteFlow Studio...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const handleOpenNewNote = () => {
    setActiveNote(null);
    setIsNoteModalOpen(true);
  };

  const handleOpenEditNote = (note) => {
    setActiveNote(note);
    setIsNoteModalOpen(true);
  };

  const handleSelectTemplate = (template) => {
    setActiveNote({ title: template.title, content: template.content });
    setIsNoteModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-[#070b19] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-x-hidden">
      {/* Ambient background light nodes */}
      <div className="ambient-glow-node w-[500px] h-[500px] bg-indigo-600/20 -top-40 -left-40" />
      <div className="ambient-glow-node w-[600px] h-[600px] bg-purple-600/15 top-1/3 -right-40" />
      <div className="ambient-glow-node w-[400px] h-[400px] bg-cyan-500/15 -bottom-20 left-1/4" />

      {/* Top Navbar */}
      <Navbar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onNewNote={handleOpenNewNote}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Sidebar + Main View */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
          onOpenTagModal={() => setIsTagModalOpen(true)}
          onOpenImportExport={() => setIsImportExportOpen(true)}
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50/70 dark:bg-[#070b19]/80 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
          <Routes>
            <Route path="/" element={<Dashboard onOpenNote={handleOpenEditNote} onShareNote={(n) => setShareNote(n)} />} />
            <Route path="/dashboard" element={<Dashboard onOpenNote={handleOpenEditNote} onShareNote={(n) => setShareNote(n)} />} />
            <Route
              path="/notes"
              element={
                <NotesPage
                  onOpenNote={handleOpenEditNote}
                  onShareNote={(n) => setShareNote(n)}
                  onNewNote={handleOpenNewNote}
                />
              }
            />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/trash" element={<TrashPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={user.role === 'ADMIN' ? <AdminPage /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      {/* Modals */}
      <NoteModal
        note={activeNote}
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onShareNote={(n) => setShareNote(n)}
        onSetReminder={(n) => setReminderNote(n)}
      />
      <ShareModal note={shareNote} isOpen={!!shareNote} onClose={() => setShareNote(null)} />
      <ReminderModal note={reminderNote} isOpen={!!reminderNote} onClose={() => setReminderNote(null)} />
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} />
      <TagModal isOpen={isTagModalOpen} onClose={() => setIsTagModalOpen(false)} />
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
      <ImportExportModal isOpen={isImportExportOpen} onClose={() => setIsImportExportOpen(false)} />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={setIsCommandPaletteOpen}
        onNewNote={handleOpenNewNote}
        onOpenImportExport={() => setIsImportExportOpen(true)}
      />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SocketProvider>
          <NoteProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/share/:shareLink" element={<PublicNotePage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/*" element={<ProtectedLayout />} />
              </Routes>
            </BrowserRouter>
          </NoteProvider>
        </SocketProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
