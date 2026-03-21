import { io } from "socket.io-client";

const url = import.meta.env.VITE_SOCKET_URL || "";

export function createSocket() {
  return io(url, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    autoConnect: false,
  });
}
