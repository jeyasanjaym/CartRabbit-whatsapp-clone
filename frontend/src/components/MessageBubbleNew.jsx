import { formatTime } from "../lib/time.js";

export default function MessageBubbleNew({ message, mine }) {
  return (
    <div className={`mb-2 flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-xl px-3 py-2 text-sm shadow ${
          mine ? "bg-wa-out text-slate-100" : "bg-wa-in text-slate-100"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <p className="mt-1 text-right text-[10px] text-slate-300/70">{formatTime(message.timestamp)}</p>
      </div>
    </div>
  );
}
