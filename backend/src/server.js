require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Simple room-based typing indicator channel (conversation-scoped).
io.on('connection', (socket) => {
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('typing', ({ conversationId, sender }) => {
    socket.to(conversationId).emit('typing', { sender });
  });

  socket.on('disconnect', () => {
    // no-op, room membership cleans up automatically
  });
});

app.set('io', io);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

start();

module.exports = server;
