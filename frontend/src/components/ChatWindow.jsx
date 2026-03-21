import { useState } from "react";
import MessageList from "./MessageList.jsx";
import styles from "./ChatWindow.module.css";

export default function ChatWindow({
  peer,
  messages,
  currentUserId,
  onSend,
  sending,
}) {
  const [text, setText] = useState("");

  function submit(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t || !peer) return;
    onSend(t);
    setText("");
  }

  if (!peer) {
    return (
      <div className={styles.placeholder}>
        <div className={styles.placeholderInner}>
          <h2 className={styles.phTitle}>WhatsApp Web Clone</h2>
          <p className={styles.phText}>
            Select a chat from the list to start messaging. Open another browser profile or
            incognito window to sign in as a second user.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.window}>
      <header className={styles.header}>
        <div className={styles.peerAvatar}>{peer.username?.[0]?.toUpperCase()}</div>
        <div>
          <h2 className={styles.peerName}>{peer.username}</h2>
          <p className={styles.status}>Active</p>
        </div>
      </header>
      <MessageList messages={messages} currentUserId={currentUserId} />
      <form className={styles.composer} onSubmit={submit}>
        <input
          className={styles.input}
          placeholder="Type a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={4000}
          disabled={sending}
        />
        <button className={styles.send} type="submit" disabled={sending || !text.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
