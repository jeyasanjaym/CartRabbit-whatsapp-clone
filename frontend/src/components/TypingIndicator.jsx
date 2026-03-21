export default function TypingIndicator({ visible, label }) {
  if (!visible) return null;
  return <p className="px-4 py-2 text-xs text-wa-muted">{label} is typing...</p>;
}
