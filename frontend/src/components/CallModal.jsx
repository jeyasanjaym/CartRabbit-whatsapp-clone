import { useEffect, useRef } from "react";

export default function CallModal({
  open,
  mode,
  incomingFrom,
  status,
  localStream,
  remoteStream,
  onAccept,
  onDecline,
  onEnd,
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (!localStream) return;
    if (mode === "video" && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    if (mode === "voice" && localAudioRef.current) {
      localAudioRef.current.srcObject = localStream;
    }
  }, [localStream, mode]);

  useEffect(() => {
    if (!remoteStream) return;
    if (mode === "video" && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (mode === "voice" && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, mode]);

  if (!open) return null;

  const isIncoming = status === "incoming";
  const isCalling = status === "calling";
  const isInCall = status === "inCall";

  const title = isIncoming
    ? `Incoming ${mode === "video" ? "video" : "voice"} call`
    : isCalling
      ? `Calling ${incomingFrom}`
      : "Call active";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-xl border border-wa-border bg-wa-panel p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">{title}</p>
            {isIncoming ? (
              <p className="text-sm text-wa-muted">From @{incomingFrom}</p>
            ) : null}
          </div>
          {mode ? (
            <p className="text-xs text-wa-muted">
              Mode: {mode === "video" ? "Video" : "Voice"}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-wa-border bg-wa-panelHeader p-2">
            <p className="mb-2 text-center text-xs text-wa-muted">Local</p>
            {mode === "video" ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-64 w-full rounded-md bg-black object-cover"
              />
            ) : (
              <audio ref={localAudioRef} autoPlay />
            )}
          </div>
          <div className="rounded-lg border border-wa-border bg-wa-panelHeader p-2">
            <p className="mb-2 text-center text-xs text-wa-muted">Remote</p>
            {mode === "video" ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-64 w-full rounded-md bg-black object-cover"
              />
            ) : (
              <audio ref={remoteAudioRef} autoPlay />
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          {isIncoming ? (
            <>
              <button
                onClick={onAccept}
                className="rounded-lg bg-wa-accent px-4 py-2 font-semibold text-white"
              >
                Accept
              </button>
              <button
                onClick={onDecline}
                className="rounded-lg border border-wa-border px-4 py-2 font-semibold"
              >
                Decline
              </button>
            </>
          ) : null}

          {isCalling || isInCall ? (
            <button
              onClick={onEnd}
              className="rounded-lg border border-wa-border px-4 py-2 font-semibold"
            >
              End call
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

