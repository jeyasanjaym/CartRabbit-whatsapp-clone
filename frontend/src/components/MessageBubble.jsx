import styles from "./MessageBubble.module.css";

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`${styles.row} ${isOwn ? styles.own : styles.other}`}>
      <div className={`${styles.bubble} ${isOwn ? styles.bubbleOut : styles.bubbleIn}`}>
        {!isOwn ? (
          <span className={styles.sender}>{message.sender?.username}</span>
        ) : null}
        <p className={styles.text}>{message.content}</p>
        <span className={styles.meta}>{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
