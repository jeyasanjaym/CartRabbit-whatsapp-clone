# WhatsApp Web Clone (MERN)

A simplified full-stack chat demo: React (Vite) frontend, Node.js + Express + Socket.IO backend, and MongoDB. Two or more users can exchange text messages in real time with a WhatsApp-inspired two-panel UI.

## Structure

```
├── backend/          # Express REST API + Socket.IO
├── frontend/         # React + React Router + Axios
└── README.md
```

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **MongoDB** running locally, or a connection string to MongoDB Atlas

## Environment variables

### Backend (`backend/.env`)

Copy from `backend/.env.example`:

| Variable        | Description                          | Example                                      |
|----------------|--------------------------------------|----------------------------------------------|
| `PORT`         | HTTP + Socket.IO port                | `5000`                                       |
| `MONGODB_URI`  | MongoDB connection string            | `mongodb://127.0.0.1:27017/whatsapp_clone`   |
| `CLIENT_ORIGIN`| Allowed CORS origin (your React app) | `http://localhost:5173`                      |

### Frontend (`frontend/.env` — optional)

For local development, the Vite dev server proxies `/api` and `/socket.io` to the backend, so you often **do not** need a `.env` file.

For production or custom ports, you can set:

| Variable           | Description                    |
|--------------------|--------------------------------|
| `VITE_API_URL`     | Base URL of the API (e.g. `https://api.example.com`) |
| `VITE_SOCKET_URL`  | Socket.IO server URL (same origin as API in most setups) |

## Run locally

### 1. MongoDB

Start MongoDB (example on Linux):

```bash
# if installed as a service
sudo systemctl start mongod
```

Or use [MongoDB Atlas](https://www.mongodb.com/atlas) and set `MONGODB_URI` in `backend/.env`.

### 2. Backend

```bash
cd backend
cp .env.example .env   # edit MONGODB_URI if needed
npm install
npm run dev
```

API: `http://localhost:5000` — health check: `GET /api/health`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### 4. Try two users

1. In a normal window, enter a username (e.g. **Sanjay**) and open **Chat**.
2. In a **private/incognito** window (or another browser), enter another username (e.g. **Arun**).
3. Select the other user in the sidebar and send messages — they should appear instantly on both sides without refresh.

## API summary

| Method | Path             | Description |
|--------|------------------|-------------|
| `POST` | `/api/users`     | Create or return existing user by `username` (body JSON) |
| `GET`  | `/api/users`     | List all users |
| `POST` | `/api/messages`  | Send message: `senderId`, `receiverId`, `content` |
| `GET`  | `/api/messages`  | Query: `userA`, `userB` — conversation between two users, chronological |

Empty or invalid messages return **400** with an error body.

## Real-time (Socket.IO)

- Client connects and emits `join` with the current user’s MongoDB `_id` (string).
- Server notifies `user:<id>` rooms when a new message is saved.
- Event: `message:new` — payload is the populated message document.

## Production build

```bash
cd frontend && npm run build
```

Serve `frontend/dist` with any static host; point `VITE_API_URL` / `VITE_SOCKET_URL` at your deployed API and ensure `CLIENT_ORIGIN` on the backend matches your frontend URL.

## License

MIT — use freely for portfolios and learning.
