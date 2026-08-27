import React from 'react';
import { X, BookOpen, Users, Lightbulb, CheckSquare, BookMarked, Code, Target, FileText } from 'lucide-react';
import { useNotes } from '../../context/NoteContext';

const TemplateModal = ({ isOpen, onClose, onSelectTemplate }) => {
  if (!isOpen) return null;

  const templates = [
    {
      id: 'meeting',
      title: '💼 Meeting Notes',
      icon: Users,
      category: 'Work',
      content: `<h1>💼 Meeting Notes</h1>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Attendees:</strong> Participant 1, Participant 2</p>

<h3>1. Agenda</h3>
<ul>
  <li>Sprint goals and updates</li>
  <li>Key architecture decisions</li>
</ul>

<h3>2. Action Items</h3>
<ul class="task-list">
  <li>[ ] Finalize API schemas</li>
  <li>[ ] Update deployment scripts</li>
</ul>`,
    },
    {
      id: 'lecture',
      title: '📚 Lecture Notes',
      icon: BookOpen,
      category: 'University',
      content: `<h1>📚 Lecture: Course Overview</h1>
<p><strong>Professor:</strong> Dr. Smith | <strong>Date:</strong> ${new Date().toLocaleDateString()}</p>

<h3>Key Concepts</h3>
<p>Summarize core theoretical principles discussed in lecture.</p>

<h3>Summary & Questions</h3>
<ul>
  <li>Review textbook chapter 4</li>
  <li>Prepare questions for next lab</li>
</ul>`,
    },
    {
      id: 'project',
      title: '💡 Project Idea',
      icon: Lightbulb,
      category: 'Projects',
      content: `<h1>💡 Project Idea: NoteFlow SaaS</h1>
<p>A smart note management application with real-time editing and AI capabilities.</p>

<h3>Features & Stack</h3>
<ul>
  <li><strong>Stack:</strong> React.js, Express, MongoDB, Socket.IO</li>
  <li><strong>Key Highlight:</strong> Auto-save & Instant Search</li>
</ul>`,
    },
    {
      id: 'todo',
      title: '📋 Weekly To-Do List',
      icon: CheckSquare,
      category: 'Personal',
      content: `<h1>📋 Weekly Goals</h1>
<ul class="task-list">
  <li>[ ] Complete NoteFlow implementation</li>
  <li>[ ] Run backend integration unit tests</li>
  <li>[ ] Review code performance metrics</li>
</ul>`,
    },
    {
      id: 'interview',
      title: '🎯 Interview Preparation',
      icon: Target,
      category: 'Programming',
      content: `<h1>🎯 Technical Interview Cheatsheet</h1>

<h3>Data Structures & Algorithms</h3>
<ul>
  <li><strong>Arrays & Strings:</strong> Two pointers, sliding window</li>
  <li><strong>Trees & Graphs:</strong> BFS, DFS traversal</li>
</ul>

<h3>System Design Notes</h3>
<p>Caching, database indexing, load balancers, rate limiting.</p>`,
    },
    {
      id: 'coding',
      title: '🧑💻 Coding Snippet Note',
      icon: Code,
      category: 'Programming',
      content: `<h1>🧑💻 Code Architecture & Snippets</h1>

<pre><code>// Example Express Middleware
const authGuard = (req, res, next) => {
  // Verify token
  next();
};</code></pre>`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Choose Note Template</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templates.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <div
                key={tpl.id}
                onClick={() => {
                  onSelectTemplate(tpl);
                  onClose();
                }}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl cursor-pointer transition group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600">
                    {tpl.title}
                  </h4>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">Category: {tpl.category}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
