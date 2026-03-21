const USER_KEY = "wa_clone_user";
const PENDING_KEY = "wa_clone_pending";

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (u?._id && u?.username && Number.isFinite(Number(u?.uniqueCode))) return u;
  } catch {
    /* ignore */
  }
  return null;
}

export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PENDING_KEY);
}

export function setPendingAuth(payload) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
}

export function getPendingAuth() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.email && data?.username) return data;
  } catch {
    /* ignore */
  }
  return null;
}

export function clearPendingAuth() {
  localStorage.removeItem(PENDING_KEY);
}
