const KEY = "wa_clone_user";

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (u?._id && u?.username) return u;
  } catch {
    /* ignore */
  }
  return null;
}

export function setStoredUser(user) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(KEY);
}
