import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { createSocket } from "../lib/socket.js";
import { clearStoredUser, getStoredUser } from "../lib/storage.js";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import styles from "./Chat.module.css";

function inConversation(msg, selfId, peerId) {
  const s = String(msg.sender?._id);
  const r = String(msg.receiver?._id);
  const a = String(selfId);
  const b = String(peerId);
  return (s === a && r === b) || (s === b && r === a);
}

export default function Chat() {
  const navigate = useNavigate();
  const me = useMemo(() => getStoredUser(), []);
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState("");
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  useEffect(() => {
    if (!me?._id) {
      navigate("/", { replace: true });
    }
  }, [me, navigate]);

  const loadUsers = useCallback(async () => {
    if (!me?._id) return;
    try {
      const { data } = await api.get("/api/users");
      const others = (data.users || []).filter((u) => String(u._id) !== String(me._id));
      setUsers(others);
      setLoadError("");
    } catch {
      setLoadError("Could not load users. Is the backend running?");
    }
  }, [me]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadMessages = useCallback(
    async (peerId) => {
      if (!me?._id || !peerId) {
        setMessages([]);
        return;
      }
      try {
        const { data } = await api.get("/api/messages", {
          params: { userA: me._id, userB: peerId },
        });
        setMessages(data.messages || []);
      } catch {
        setMessages([]);
      }
    },
    [me]
  );

  useEffect(() => {
    setMessages([]);
    loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    if (!me?._id) return;
    const socket = createSocket();
    socket.connect();
    socket.emit("join", me._id);

    function onNew(msg) {
      const peer = selectedIdRef.current;
      if (!peer) return;
      if (!inConversation(msg, me._id, peer)) return;
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      });
    }

    socket.on("message:new", onNew);
    return () => {
      socket.emit("leave", me._id);
      socket.off("message:new", onNew);
      socket.disconnect();
    };
  }, [me?._id]);

  const peer = users.find((u) => String(u._id) === String(selectedId)) || null;

  async function handleSend(content) {
    if (!me?._id || !selectedId) return;
    setSending(true);
    try {
      const { data } = await api.post("/api/messages", {
        senderId: me._id,
        receiverId: selectedId,
        content,
      });
      const msg = data.message;
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    } catch (err) {
      const m = err.response?.data?.error || "Failed to send";
      alert(m);
    } finally {
      setSending(false);
    }
  }

  function handleLogout() {
    clearStoredUser();
    navigate("/", { replace: true });
  }

  if (!me?._id) return null;

  return (
    <div className={styles.layout}>
      {loadError ? <div className={styles.banner}>{loadError}</div> : null}
      <div className={styles.shell}>
        <Sidebar
          users={users}
          currentUser={me}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onLogout={handleLogout}
        />
        <ChatWindow
          peer={peer}
          messages={messages}
          currentUserId={me._id}
          onSend={handleSend}
          sending={sending}
        />
      </div>
    </div>
  );
}
