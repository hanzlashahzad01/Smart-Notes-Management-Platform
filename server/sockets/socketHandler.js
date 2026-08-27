const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket Connected]: ${socket.id}`);

    // Join personal user room for private notifications
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined user room: ${userId}`);
      }
    });

    // Note collaboration room
    socket.on('join_note', ({ noteId, userName }) => {
      if (noteId) {
        socket.join(`note_${noteId}`);
        socket.to(`note_${noteId}`).emit('user_joined_note', { socketId: socket.id, userName });
      }
    });

    socket.on('leave_note', ({ noteId, userName }) => {
      if (noteId) {
        socket.leave(`note_${noteId}`);
        socket.to(`note_${noteId}`).emit('user_left_note', { socketId: socket.id, userName });
      }
    });

    // Real-time co-editing typing status
    socket.on('editing_note', ({ noteId, userName, isEditing }) => {
      if (noteId) {
        socket.to(`note_${noteId}`).emit('note_editing_status', {
          socketId: socket.id,
          userName,
          isEditing,
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected]: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
