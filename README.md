# 🚀 NoteFlow — Smart Notes Management Platform

NoteFlow is a fully automated, secure, responsive, and scalable smart notes management platform built using the MERN stack (MongoDB, Express.js, React.js, Node.js), Socket.IO, Nodemailer, TipTap editor, and AI services.

---

## 🌟 Key Features

1. **👤 Authentication & User Security**
   - JWT authentication with HTTP-only cookies and access/refresh token rotation.
   - Password hashing with bcrypt, rate limiting, and brute-force protection.
   - Forgot password & email verification workflows.
   - Active device session management and "Logout from all devices".

2. **📝 Advanced Notes System**
   - Rich text editor powered by TipTap (headlists, checklists, code blocks, tables, highlights, links).
   - Instant debounced text index search over title, plain text content, tags, and categories.
   - Automatic debounced auto-save (`Typing...`, `Saving...`, `Saved ✓`).
   - Note pinning 📌, favoriting ⭐, archiving 📁, and trash bin with retention auto-purge.

3. **🤖 AI Assistant Suite**
   - **AI Summarize**: Extracts bullet point summaries from note content.
   - **AI Generate**: Generates structured notes based on user topics.
   - **AI Rewrite**: Adjusts tone, fixes grammar, or condenses text.
   - **AI Ask**: Interactive Q&A over note contents.

4. **📂 Folders, Tags & Reminders**
   - Custom folder categories with color codes and nested structure support.
   - Multi-tag filtering and usage counting.
   - Scheduled note reminders triggering in-app Socket.IO alerts and automated emails.

5. **🤝 Sharing & Public Links**
   - Granular user-to-user note sharing (Viewer / Editor permissions).
   - Sharable public links with optional password protection and expiration dates.
   - Moderation reporting system for shared/public notes.

6. **📊 Professional Dashboard & Analytics**
   - Overview metrics, recent notes grid, folder counts, and weekly activity velocity chart.
   - User account data backup with JSON, Markdown (.md), and TXT export & import tools.

7. **🛡️ Admin Panel & System Settings**
   - Role-Based Access Control (`USER` / `ADMIN`).
   - System user management, account activation toggle, and moderation report resolution.

---

## 🧱 Tech Stack & Architecture

- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.IO, Nodemailer, Node-Cron, Helmet, Express-Rate-Limit.
- **Frontend**: React.js, Vite, Tailwind CSS, TipTap Editor, Lucide Icons, Axios.
- **Testing**: Jest, Supertest.

```
Smart Notes Management Platform/
├── server/             # Express API, Controllers, Models, Cron Jobs, Socket.IO
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
└── client/             # Vite React Application, Components, Context, Pages
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── App.jsx
    └── vite.config.js
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB running locally at `mongodb://localhost:27017/noteflow` or MongoDB Atlas URI.

### 1. Server Setup
```bash
cd server
npm install
npm start
```
*Runs backend server on `http://localhost:5000`*

### 2. Client Setup
```bash
cd client
npm install
npm run dev
```
*Runs frontend application on `http://localhost:5173`*

---

## 📄 REST API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT cookies |
| `GET` | `/api/notes` | Fetch user notes with search & filters |
| `POST` | `/api/notes` | Create a new note |
| `PUT` | `/api/notes/:id` | Update note with auto-save |
| `DELETE` | `/api/notes/:id` | Move note to trash |
| `POST` | `/api/shares/share` | Share note with another registered user |
| `POST` | `/api/ai/summarize` | AI summarize note content |
| `GET` | `/api/data/export` | Export user data (JSON/MD/TXT) |
| `GET` | `/api/admin/stats` | Admin system metrics dashboard |

---

## 🧪 Testing

To run the automated API and auth unit tests:
```bash
cd server
npm test
```
