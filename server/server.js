require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const socketHandler = require('./sockets/socketHandler');
const initBackgroundJobs = require('./services/jobScheduler');

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Create HTTP Server & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Initialize Socket.IO Handler
socketHandler(io);

// Initialize Cron Jobs
initBackgroundJobs(io);

// Start Server
server.listen(PORT, () => {
  console.log(`\n🚀 NoteFlow Backend Server running on port ${PORT}`);
  console.log(`🌐 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Endpoint: http://localhost:${PORT}/api\n`);
});
