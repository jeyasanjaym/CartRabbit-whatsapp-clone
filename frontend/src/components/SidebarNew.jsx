import { formatTime } from "../lib/time.js";

export default function SidebarNew({
  me,
  users,
  selectedUser,
  setSelectedUser,
  searchUsername,
  setSearchUsername,
  onSearchUser,
  onLogout,
}) {
  return (
    <aside className="w-full max-w-sm border-r border-wa-border bg-wa-panel">
      <div className="flex items-center justify-between border-b border-wa-border bg-wa-panelHeader p-3">
        <div>
          <p className="font-semibold">{me.username}</p>
          <p className="text-xs text-wa-muted">@{me.username}</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-wa-border px-2 py-1 text-xs" onClick={() => navigator.clipboard.writeText(me.username)}>
            Copy Username
          </button>
          <button className="rounded-md border border-wa-border px-2 py-1 text-xs" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
      <div className="flex gap-2 border-b border-wa-border p-3">
        <input
          className="flex-1 rounded-md bg-wa-panelHeader px-3 py-2 text-sm outline-none"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
          placeholder="Search by username (e.g. sanjay)"
        />
        <button onClick={onSearchUser} className="rounded-md bg-wa-accent px-3 text-sm">
          Add
        </button>
      </div>
      <div className="max-h-[calc(100vh-140px)] overflow-y-auto">
        {users.map((u) => (
          <button
            key={u.username}
            onClick={() => setSelectedUser(u.username)}
            className={`flex w-full items-center gap-3 border-b border-wa-border/60 px-3 py-3 text-left hover:bg-wa-panelHeader ${
              selectedUser === u.username ? "bg-wa-panelHeader" : ""
            }`}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-600 text-sm font-semibold">
              {u.username?.slice(0, 1).toUpperCase()}
              <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-wa-panel ${u.isOnline ? "bg-emerald-500" : "bg-slate-500"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{u.username}</p>
                <p className="text-[10px] text-wa-muted">{formatTime(u.lastMessage?.timestamp)}</p>
              </div>
              <p className="truncate text-xs text-wa-muted">
                {u.lastMessage?.text || `@${u.username}`}
              </p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
