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
  const selectedUserRef = useRef(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const iceQueueRef = useRef([]);
  const pendingOfferRef = useRef(null);
  const pendingModeRef = useRef(null);
  const callPeerRef = useRef(null);
  const callStatusRef = useRef("idle");

  const [call, setCall] = useState({
    open: false,
    status: "idle", // idle | incoming | calling | inCall
    mode: null, // voice | video
    incomingFrom: null,
    localStream: null,
    remoteStream: null,
  });

  const peer = useMemo(
    () => users.find((u) => u.username === selectedUser) || null,
    [users, selectedUser]
  );

  useEffect(() => {
    if (!user?._id) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    callStatusRef.current = call.status;
  }, [call.status]);

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
      const currentPeer = selectedUserRef.current;
      if (currentPeer && isSameThread(message, user.username, currentPeer)) {
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

    // -----------------------------
    // Call signaling handlers
    // -----------------------------
    socket.on("call:offer", async ({ from, to, mode, offer }) => {
      if (to !== user.username) return;

      // If we're busy, refuse the call early.
      if (callStatusRef.current !== "idle") {
        socket.emit("call:decline", {
          from: user.username,
          to: from,
          reason: "busy",
        });
        return;
      }

      pendingOfferRef.current = offer;
      pendingModeRef.current = mode;
      callPeerRef.current = from;

      setCall({
        open: true,
        status: "incoming",
        mode,
        incomingFrom: from,
        localStream: null,
        remoteStream: null,
      });
    });

    socket.on("call:answer", async ({ from, to, answer }) => {
      if (to !== user.username) return;
      if (from !== callPeerRef.current) return;
      if (!pcRef.current) return;

      const pc = pcRef.current;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      // Flush any ICE candidates received early.
      while (iceQueueRef.current.length) {
        const candidate = iceQueueRef.current.shift();
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }

      setCall((prev) => ({
        ...prev,
        status: "inCall",
      }));
    });

    socket.on("call:ice", async ({ from, to, candidate }) => {
      if (to !== user.username) return;
      if (from !== callPeerRef.current) return;
      if (!candidate) return;

      const pc = pcRef.current;
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Failed to add ICE candidate:", e);
        }
      } else {
        iceQueueRef.current.push(candidate);
      }
    });

    socket.on("call:decline", ({ from, to }) => {
      if (to !== user.username) return;
      if (from !== callPeerRef.current) return;
      cleanupCall({ emitEnd: false, silent: true });
    });

    socket.on("call:end", ({ from, to }) => {
      if (to !== user.username) return;
      if (from !== callPeerRef.current) return;
      cleanupCall({ emitEnd: false, silent: true });
    });

    return () => socket.disconnect();
  }, [user]);

  function cleanupCall({ emitEnd, silent }) {
    try {
      if (emitEnd && socketRef.current && callPeerRef.current) {
        socketRef.current.emit("call:end", {
          from: user.username,
          to: callPeerRef.current,
        });
      }

      if (pcRef.current) {
        try {
          pcRef.current.onicecandidate = null;
          pcRef.current.ontrack = null;
          pcRef.current.close();
        } catch {
          /* ignore */
        }
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      pcRef.current = null;
      localStreamRef.current = null;
      remoteStreamRef.current = null;
      iceQueueRef.current = [];
      pendingOfferRef.current = null;
      pendingModeRef.current = null;
      callPeerRef.current = null;

      if (!silent) {
        setCall({
          open: false,
          status: "idle",
          mode: null,
          incomingFrom: null,
          localStream: null,
          remoteStream: null,
        });
      } else {
        setCall((prev) => ({
          ...prev,
          open: false,
          status: "idle",
          mode: null,
          incomingFrom: null,
          localStream: null,
          remoteStream: null,
        }));
      }
    } catch (e) {
      console.error("cleanupCall failed:", e);
    }
  }

  function getMediaConstraints(mode) {
    return {
      audio: true,
      video: mode === "video",
    };
  }

  async function ensurePeerConnection() {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.ontrack = (event) => {
      const stream = event.streams?.[0];
      if (!stream) return;
      remoteStreamRef.current = stream;
      setCall((prev) => ({ ...prev, remoteStream: stream }));
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      const to = callPeerRef.current;
      if (!to || !socketRef.current) return;
      socketRef.current.emit("call:ice", {
        from: user.username,
        to,
        candidate: event.candidate,
      });
    };

    pcRef.current = pc;
    return pc;
  }

  async function startCall(mode) {
    const peerUsername = selectedUserRef.current;
    if (!peerUsername || peerUsername === user.username) return;
    if (callStatusRef.current !== "idle") return;

    callPeerRef.current = peerUsername;

    const stream = await navigator.mediaDevices.getUserMedia(
      getMediaConstraints(mode)
    );
    localStreamRef.current = stream;
    setCall({
      open: true,
      status: "calling",
      mode,
      incomingFrom: peerUsername,
      localStream: stream,
      remoteStream: null,
    });

    const pc = await ensurePeerConnection();
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    pendingOfferRef.current = offer;
    pendingModeRef.current = mode;

    socketRef.current?.emit("call:offer", {
      from: user.username,
      to: peerUsername,
      mode,
      offer,
    });
  }

  async function acceptCall() {
    if (callStatusRef.current !== "incoming") return;
    if (!pendingOfferRef.current || !callPeerRef.current) return;

    const mode = pendingModeRef.current;
    const caller = callPeerRef.current;

    const stream = await navigator.mediaDevices.getUserMedia(
      getMediaConstraints(mode)
    );
    localStreamRef.current = stream;

    setCall((prev) => ({
      ...prev,
      open: true,
      status: "calling",
      localStream: stream,
      remoteStream: null,
    }));

    const pc = await ensurePeerConnection();
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    await pc.setRemoteDescription(
      new RTCSessionDescription(pendingOfferRef.current)
    );

    // Flush any ICE candidates we already received.
    while (iceQueueRef.current.length) {
      const candidate = iceQueueRef.current.shift();
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socketRef.current?.emit("call:answer", {
      from: user.username,
      to: caller,
      answer,
    });

    setCall((prev) => ({
      ...prev,
      status: "inCall",
    }));
  }

  function declineCall() {
    if (callStatusRef.current !== "incoming") return;
    const caller = callPeerRef.current;

    socketRef.current?.emit("call:decline", {
      from: user.username,
      to: caller,
      reason: "declined",
    });

    cleanupCall({ emitEnd: false, silent: false });
  }

  function endCall() {
    if (callStatusRef.current === "idle") return;
    cleanupCall({ emitEnd: true, silent: false });
  }

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
        call={call}
        onStartVoiceCall={() => startCall("voice")}
        onStartVideoCall={() => startCall("video")}
        onAcceptCall={acceptCall}
        onDeclineCall={declineCall}
        onEndCall={endCall}
      />
    </main>
  );
}
