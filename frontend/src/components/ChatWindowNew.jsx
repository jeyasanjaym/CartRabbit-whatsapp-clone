import { useEffect, useRef, useState } from "react";
import MessageBubbleNew from "./MessageBubbleNew.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import CallModal from "./CallModal.jsx";

export default function ChatWindowNew({
  me,
  peer,
  messages,
  onSend,
  typing,
  sendTypingStart,
  sendTypingStop,
  call,
  onStartVoiceCall,
  onStartVideoCall,
  onAcceptCall,
  onDeclineCall,
  onEndCall,
}) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const openCallModal = Boolean(call?.open);

  function submit(e) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText("");
    sendTypingStop();
  }

  function handleType(value) {
    setText(value);
    if (value.trim()) sendTypingStart();
    else sendTypingStop();
  }

  return (
    <>
      <CallModal
        open={openCallModal}
        mode={call?.mode}
        incomingFrom={call?.incomingFrom}
        status={call?.status}
        localStream={call?.localStream}
        remoteStream={call?.remoteStream}
        onAccept={onAcceptCall}
        onDecline={onDeclineCall}
        onEnd={onEndCall}
      />

      {!peer ? (
        <div className="flex flex-1 items-center justify-center text-wa-muted">
          Select or search a username to start chatting.
        </div>
      ) : (
        <section className="flex flex-1 flex-col bg-wa-bg">
          <div className="border-b border-wa-border bg-wa-panelHeader px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{peer.username}</p>
                <p className="text-xs text-wa-muted">
                  {peer.isOnline ? "Online" : "Offline"} • @{peer.username}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  className="rounded-md border border-wa-border px-2 py-1 text-xs"
                  onClick={onStartVoiceCall}
                  disabled={call?.status === "calling" || call?.status === "inCall"}
                >
                  Voice
                </button>
                <button
                  className="rounded-md border border-wa-border px-2 py-1 text-xs"
                  onClick={onStartVideoCall}
                  disabled={call?.status === "calling" || call?.status === "inCall"}
                >
                  Video
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {messages.map((m) => (
              <MessageBubbleNew
                key={m._id}
                message={m}
                mine={m.sender === me.username}
              />
            ))}
            <TypingIndicator visible={typing} label={peer.username} />
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={submit}
            className="flex gap-2 border-t border-wa-border bg-wa-panelHeader p-3"
          >
            <input
              className="flex-1 rounded-lg bg-wa-panel px-3 py-2 outline-none"
              value={text}
              onChange={(e) => handleType(e.target.value)}
              onBlur={sendTypingStop}
              placeholder="Type a message"
            />
            <button className="rounded-lg bg-wa-accent px-4 py-2 font-semibold">
              Send
            </button>
          </form>
        </section>
      )}
    </>
  );
}
