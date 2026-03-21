import styles from "./Sidebar.module.css";

export default function Sidebar({
  users,
  currentUser,
  selectedId,
  onSelect,
  onLogout,
}) {
  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <div className={styles.me}>
          <div className={styles.avatar}>{currentUser.username?.[0]?.toUpperCase()}</div>
          <div className={styles.meText}>
            <span className={styles.meName}>{currentUser.username}</span>
            <span className={styles.meHint}>You</span>
          </div>
        </div>
        <button type="button" className={styles.logout} onClick={onLogout}>
          Log out
        </button>
      </header>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon} aria-hidden />
        <input
          className={styles.search}
          type="search"
          placeholder="Chats"
          readOnly
          tabIndex={-1}
        />
      </div>
      <ul className={styles.list}>
        {users.map((u) => {
          const active = String(u._id) === String(selectedId);
          return (
            <li key={u._id}>
              <button
                type="button"
                className={`${styles.item} ${active ? styles.active : ""}`}
                onClick={() => onSelect(u._id)}
              >
                <div className={styles.peerAvatar}>{u.username?.[0]?.toUpperCase()}</div>
                <span className={styles.peerName}>{u.username}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
