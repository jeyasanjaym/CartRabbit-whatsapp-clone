import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarNew from "../components/SidebarNew.jsx";
import ChatWindowNew from "../components/ChatWindowNew.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import { createSocket } from "../lib/socket.js";

function isSameThread(message, a, b) {
  return (
    (message.sender === a && message.receiver === b) ||
    (message.sender === b && message.receiver === a)
  );
}

export default function ChatDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [typingByUser, setTypingByUser] = useState({});
  const socketRef = useRef(null);

  const peer = useMemo(
    () => users.find((u) => u.username === selectedUser) || null,
    [users, selectedUser]
  );

  useEffect(() => {
    if (!user?._id) navigate("/");
  }, [user, navigate]);

  async function loadUsers() {
    const { data } = await api.get("/api/users", { params: { currentUsername: user.username } });
    setUsers(data.users || []);
  }

  useEffect(() => {
    if (!user) return;
    loadUsers();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedUser) return;
    api
      .get("/api/messages", {
        params: { userA: user.username, userB: selectedUser },
      })
      .then(({ data }) => setMessages(data.messages || []))
      .catch(() => setMessages([]));
  }, [user, selectedUser]);

  useEffect(() => {
    if (!user) return;
    const socket = createSocket();
    socketRef.current = socket;
    socket.connect();
    socket.emit("user:join", user.username);

    socket.on("message:new", (message) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.username === message.sender || u.username === message.receiver
            ? { ...u, lastMessage: message }
            : u
        )
      );
      if (selectedUser && isSameThread(message, user.username, selectedUser)) {
        setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
      }
    });

    socket.on("typing:update", ({ from, isTyping }) => {
      setTypingByUser((prev) => ({ ...prev, [from]: isTyping }));
    });

    socket.on("presence:update", ({ username, isOnline }) => {
      setUsers((prev) =>
        prev.map((u) => (u.username === username ? { ...u, isOnline } : u))
      );
    });

    return () => socket.disconnect();
  }, [user, selectedUser]);

  async function onSearchUser() {
    const username = searchUsername.trim();
    if (!username || username === user.username) return;
    const exists = users.some((u) => u.username === username);
    if (exists) {
      setSelectedUser(username);
      return;
    }
    try {
      const { data } = await api.get(`/api/users/${username}`);
      setUsers((prev) => [{ ...data.user, lastMessage: null }, ...prev]);
      setSelectedUser(username);
      setSearchUsername("");
    } catch {
      // no-op
    }
  }

  async function onSend(text) {
    const { data } = await api.post("/api/messages", {
      sender: user.username,
      receiver: selectedUser,
      text,
    });
    const message = data.message;
    setMessages((prev) => [...prev, message]);
    setUsers((prev) =>
      prev.map((u) => (u.username === selectedUser ? { ...u, lastMessage: message } : u))
    );
  }

  function sendTypingStart() {
    if (!selectedUser) return;
    socketRef.current?.emit("typing:start", { from: user.username, to: selectedUser });
  }

  function sendTypingStop() {
    if (!selectedUser) return;
    socketRef.current?.emit("typing:stop", { from: user.username, to: selectedUser });
  }

  return (
    <main className="flex h-full">
      <SidebarNew
        me={user}
        users={users}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        searchUsername={searchUsername}
        setSearchUsername={setSearchUsername}
        onSearchUser={onSearchUser}
        onLogout={logout}
      />
      <ChatWindowNew
        me={user}
        peer={peer}
        messages={messages}
        onSend={onSend}
        typing={Boolean(peer && typingByUser[peer.username])}
        sendTypingStart={sendTypingStart}
        sendTypingStop={sendTypingStop}
      />
    </main>
  );
}
