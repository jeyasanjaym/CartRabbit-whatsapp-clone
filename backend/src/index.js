import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import User from "./models/User.js";

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/whatsapp_clone";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
});
const activeSockets = new Map();

io.on("connection", (socket) => {
  socket.on("user:join", async (username) => {
    if (!username || typeof username !== 'string') return;
    socket.data.username = username;
    socket.join(`user:${username}`);
    const count = activeSockets.get(username) || 0;
    activeSockets.set(username, count + 1);
    io.emit("presence:update", { username, isOnline: true });
  });

  socket.on("typing:start", ({ from, to }) => {
    if (!from || !to) return;
    io.to(`user:${to}`).emit("typing:update", { from, isTyping: true });
  });

  socket.on("typing:stop", ({ from, to }) => {
    if (!from || !to) return;
    io.to(`user:${to}`).emit("typing:update", { from, isTyping: false });
  });

  socket.on("disconnect", async () => {
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
  });
});

function emitNewMessage(message) {
  if (!message?.sender || !message?.receiver) {
    return;
  }
  const sender = message.sender;
  const receiver = message.receiver;
  io.to(`user:${sender}`).emit("message:new", message);
  io.to(`user:${receiver}`).emit("message:new", message);
}

app.locals.emitNewMessage = emitNewMessage;

async function main() {
  console.log('Starting server...');
  console.log('Environment variables check:');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  console.log('PORT:', process.env.PORT || 'Not set (will use 5000)');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
  
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected');

  server.listen(PORT, () => {
    console.log(`API + Socket.IO on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Server startup failed:', err.message);
  console.error('Full error:', err);
  process.exit(1);
});
