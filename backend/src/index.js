import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/whatsapp_clone";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

console.log('Starting server with config:');
console.log('PORT:', PORT);
console.log('MONGODB_URI:', MONGODB_URI ? 'Set' : 'Not set');
console.log('CLIENT_ORIGIN:', CLIENT_ORIGIN);

try {
  const app = createApp();
  
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
  });
  
  const activeSockets = new Map();

  io.on("connection", (socket) => {
    console.log('Socket connected:', socket.id);
    
    socket.on("user:join", async (username) => {
      try {
        if (!username || typeof username !== 'string') return;
        socket.data.username = username;
        socket.join(`user:${username}`);
        const count = activeSockets.get(username) || 0;
        activeSockets.set(username, count + 1);
        io.emit("presence:update", { username, isOnline: true });
        console.log(`User ${username} joined`);
      } catch (error) {
        console.error('Error in user:join:', error);
      }
    });

    socket.on("typing:start", ({ from, to }) => {
      try {
        if (!from || !to) return;
        io.to(`user:${to}`).emit("typing:update", { from, isTyping: true });
      } catch (error) {
        console.error('Error in typing:start:', error);
      }
    });

    socket.on("typing:stop", ({ from, to }) => {
      try {
        if (!from || !to) return;
        io.to(`user:${to}`).emit("typing:update", { from, isTyping: false });
      } catch (error) {
        console.error('Error in typing:stop:', error);
      }
    });

    socket.on("disconnect", async () => {
      try {
        const username = socket.data.username;
        if (!username) return;
        const current = activeSockets.get(username) || 0;
        const next = Math.max(current - 1, 0);
        if (next === 0) {
          activeSockets.delete(username);
          io.emit("presence:update", { username, isOnline: false });
          return;
        }
        activeSockets.set(username, next);
        console.log(`User ${username} disconnected`);
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });
  });

  function emitNewMessage(message) {
    try {
      if (!message?.sender || !message?.receiver) {
        console.error('Invalid message format:', message);
        return;
      }
      const sender = message.sender;
      const receiver = message.receiver;
      io.to(`user:${sender}`).emit("message:new", message);
      io.to(`user:${receiver}`).emit("message:new", message);
      console.log(`Message emitted from ${sender} to ${receiver}`);
    } catch (error) {
      console.error('Error in emitNewMessage:', error);
    }
  }

  app.locals.emitNewMessage = emitNewMessage;

  async function main() {
    try {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected successfully');

      app.listen(PORT, () => {
        console.log(`Server running successfully on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
      });
    } catch (error) {
      console.error('Failed to start server:', error.message);
      console.error('Full error details:', error);
      process.exit(1);
    }
  }

  main().catch((err) => {
    console.error('Unhandled error in main:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });

} catch (error) {
  console.error('Fatal error during server initialization:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}
