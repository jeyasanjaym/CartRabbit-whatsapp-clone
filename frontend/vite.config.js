import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function proxyBackendUnreachable() {
  return JSON.stringify({
    error: "Backend unreachable",
    details:
      'Nothing is listening on port 5000. In a new terminal: cd backend, then npm run dev. Wait until you see "MongoDB connected successfully" and "Server running". If it stops at MongoDB: Atlas → Network Access → IP Access List → Add Current IP (or 0.0.0.0/0 for dev). Or use local Mongo: set MONGODB_URI=mongodb://127.0.0.1:27017/whatsapp_clone in backend/.env and ensure MongoDB is running.',
  });
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("error", (_err, _req, res) => {
            if (!res || res.writableEnded || res.headersSent) return;
            try {
              res.writeHead(502, { "Content-Type": "application/json" });
              res.end(proxyBackendUnreachable());
            } catch {
              /* ignore */
            }
          });
        },
      },
      "/socket.io": {
        target: "http://localhost:5000",
        ws: true,
      },
    },
  },
});
