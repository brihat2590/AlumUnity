"use client";

import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";

interface Props {
  roomId: string;
  mode?: "voice" | "video";
}

type CallRole = "caller" | "callee" | null;

type SignalName = "video-offer" | "video-answer" | "ice-candidate";

type PusherChannel = {
  members?: {
    count: number;
  };
  bind: (eventName: string, callback: (...args: unknown[]) => void) => void;
  unbind_all: () => void;
};

export default function VideoCall({ roomId, mode = "video" }: Props) {
  const [status, setStatus] = useState("Initializing...");
  const [participantCount, setParticipantCount] = useState(0);
  const [role, setRole] = useState<CallRole>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(mode === "video");
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pendingOffer = useRef<RTCSessionDescriptionInit | null>(null);
  const pendingAnswer = useRef<RTCSessionDescriptionInit | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const offerSent = useRef(false);
  const roleRef = useRef<CallRole>(null);
  const peerJoined = useRef(false);
  const localUserId = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `guest-${Date.now()}`
  );
  const channelName = `presence-video-${roomId}`;

  const sendSignal = async (eventName: SignalName, data: unknown) => {
    await fetch("/api/web-rtc/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelName, eventName, data }),
    });
  };

  useEffect(() => {
    let isMounted = true;
    let channel: PusherChannel | null = null;
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      channelAuthorization: {
        transport: "ajax",
        endpoint: "/api/pusher/auth",
        params: {
          user_id: localUserId.current,
        },
      },
    });

    const flushPendingCandidates = async () => {
      if (!pc.current?.remoteDescription || pendingCandidates.current.length === 0) {
        return;
      }

      while (pendingCandidates.current.length > 0) {
        const candidate = pendingCandidates.current.shift();
        if (candidate) {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    };

    const startCallerOffer = async () => {
      if (roleRef.current !== "caller" || offerSent.current || !pc.current || !peerJoined.current) {
        return;
      }

      offerSent.current = true;
      setStatus("Calling...");
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      await sendSignal("video-offer", offer);
    };

    const applyPendingOffer = async () => {
      if (roleRef.current !== "callee" || !pc.current || !pendingOffer.current) {
        return;
      }

      const offer = pendingOffer.current;
      pendingOffer.current = null;
      setStatus("In Call");
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      await flushPendingCandidates();
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      await sendSignal("video-answer", answer);
    };

    const applyPendingAnswer = async () => {
      if (roleRef.current !== "caller" || !pc.current || !pendingAnswer.current) {
        return;
      }

      const answer = pendingAnswer.current;
      pendingAnswer.current = null;
      setStatus("In Call");
      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
      await flushPendingCandidates();
    };

    const init = async () => {
      try {
        channel = pusher.subscribe(channelName) as PusherChannel;

        channel.bind("pusher:subscription_succeeded", () => {
          const count = channel?.members?.count ?? 0;
          const nextRole: CallRole = count <= 1 ? "caller" : "callee";

          roleRef.current = nextRole;
          setRole(nextRole);
          setParticipantCount(count);
          peerJoined.current = count > 1;
          setStatus(count > 1 ? "Connected. Joining call..." : "Waiting for another participant...");

          void startCallerOffer();
        });

        channel.bind("pusher:member_added", () => {
          const count = channel?.members?.count ?? 0;
          setParticipantCount(count);
          peerJoined.current = count > 1;

          if (peerJoined.current) {
            setStatus(roleRef.current === "caller" ? "Calling..." : "Connecting...");
          }

          void startCallerOffer();
        });

        channel.bind("pusher:member_removed", () => {
          const count = channel?.members?.count ?? 0;
          setParticipantCount(count);
          peerJoined.current = count > 1;

          if (!peerJoined.current && roleRef.current === "caller") {
            offerSent.current = false;
            setStatus("Waiting for another participant...");
          }
        });

        channel.bind("video-offer", async (...args: unknown[]) => {
          const offer = args[0] as RTCSessionDescriptionInit;

          if (roleRef.current === "caller") {
            return;
          }

          if (!pc.current) {
            pendingOffer.current = offer;
            return;
          }

          setStatus("In Call");
          await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
          await flushPendingCandidates();
          const answer = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answer);
          await sendSignal("video-answer", answer);
        });

        channel.bind("video-answer", async (...args: unknown[]) => {
          const answer = args[0] as RTCSessionDescriptionInit;

          if (roleRef.current !== "caller") {
            return;
          }

          if (!pc.current) {
            pendingAnswer.current = answer;
            return;
          }

          setStatus("In Call");
          await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
          await flushPendingCandidates();
        });

        channel.bind("ice-candidate", async (...args: unknown[]) => {
          const candidate = args[0] as RTCIceCandidateInit;

          if (!pc.current || !pc.current.remoteDescription) {
            pendingCandidates.current.push(candidate);
            return;
          }

          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: mode === "video",
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          pusher.unsubscribe(channelName);
          pusher.disconnect();
          return;
        }

        localStream.current = stream;
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !isMuted;
        });
        stream.getVideoTracks().forEach((track) => {
          track.enabled = isCameraOn;
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        pc.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        stream.getTracks().forEach((track) => {
          pc.current?.addTrack(track, stream);
        });

        pc.current.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        pc.current.onicecandidate = (event) => {
          if (event.candidate) {
            void sendSignal("ice-candidate", event.candidate.toJSON());
          }
        };

        await applyPendingOffer();
        await applyPendingAnswer();
        await startCallerOffer();
      } catch (error) {
        console.error("WebRTC Error:", error);
        setStatus("Permission denied or connection error");
      }
    };

    void init();

    return () => {
      isMounted = false;
      channel?.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
      pc.current?.close();
      localStream.current?.getTracks().forEach((track) => track.stop());
    };
  }, [roomId, mode]);

  useEffect(() => {
    const audioTracks = localStream.current?.getAudioTracks() ?? [];
    audioTracks.forEach((track) => {
      track.enabled = !isMuted;
    });
  }, [isMuted]);

  useEffect(() => {
    const videoTracks = localStream.current?.getVideoTracks() ?? [];
    videoTracks.forEach((track) => {
      track.enabled = isCameraOn;
    });
  }, [isCameraOn]);

  const hangUp = () => {
    window.location.href = "/call";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold">{status}</h2>
        <p className="mt-1 text-sm text-white/60">
          Room {roomId} · {participantCount} participant{participantCount === 1 ? "" : "s"}
          {role ? ` · ${role}` : ""} · {mode === "video" ? "video" : "voice"} call
        </p>
      </div>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
          <p className="absolute left-2 top-2 rounded bg-black/50 px-2 py-1 text-xs">You</p>
          {mode === "video" ? (
            <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-80 min-h-[320px] items-center justify-center bg-gradient-to-br from-slate-950 to-slate-800 text-sm text-white/70">
              Voice call active
            </div>
          )}
        </div>

        <div className="relative overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
          <p className="absolute left-2 top-2 rounded bg-black/50 px-2 py-1 text-xs">Remote</p>
          {mode === "video" ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-80 min-h-[320px] items-center justify-center bg-gradient-to-br from-slate-950 to-slate-800 text-sm text-white/70">
              Remote voice participant
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setIsMuted((current) => !current)}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm transition-colors hover:bg-white/10"
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button
          type="button"
          onClick={() => setIsCameraOn((current) => !current)}
          disabled={mode === "voice"}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCameraOn ? "Camera off" : "Camera on"}
        </button>
        <button
          type="button"
          onClick={hangUp}
          className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
        >
          End call
        </button>
      </div>
    </div>
  );
}