import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";
import styles from "./MessageList.module.css";

export default function MessageList({ messages, currentUserId }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.scroller}>
      <div className={styles.inner}>
        {messages.length === 0 ? (
          <p className={styles.empty}>No messages yet. Say hello.</p>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m._id}
              message={m}
              isOwn={String(m.sender?._id) === String(currentUserId)}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
