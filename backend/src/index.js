import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/whatsapp_clone";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (!userId || typeof userId !== "string") return;
    socket.join(`user:${userId}`);
  });

  socket.on("leave", (userId) => {
    if (!userId || typeof userId !== "string") return;
    socket.leave(`user:${userId}`);
  });
});

function emitNewMessage(message) {
  if (!message?.sender?._id || !message?.receiver?._id) return;
  const senderId = String(message.sender._id);
  const receiverId = String(message.receiver._id);
  io.to(`user:${senderId}`).emit("message:new", message);
  io.to(`user:${receiverId}`).emit("message:new", message);
}

app.locals.emitNewMessage = emitNewMessage;

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected");

  server.listen(PORT, () => {
    console.log(`API + Socket.IO on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
