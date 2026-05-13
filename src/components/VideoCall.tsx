"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Pusher from "pusher-js";
import { useFirebase } from "@/firebase/firebase.config";
import { getUserInfo } from "@/firebase/user.controller";
import UserAvatar from "@/components/UserAvatar";

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
  const { loggedInUser } = useFirebase();
  const [status, setStatus] = useState("Initializing...");
  const [participantCount, setParticipantCount] = useState(0);
  const [role, setRole] = useState<CallRole>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(mode === "video");
  const [localIdentity, setLocalIdentity] = useState<{ name: string; photoUrl?: string } | null>(null);
  const [remoteIdentity, setRemoteIdentity] = useState<{ name: string; photoUrl?: string } | null>(null);
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [remoteSpeaking, setRemoteSpeaking] = useState(false);
  const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null);
  const [remoteStreamState, setRemoteStreamState] = useState<MediaStream | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const localSpeechFrame = useRef<number | null>(null);
  const remoteSpeechFrame = useRef<number | null>(null);
  const localSpeechContext = useRef<AudioContext | null>(null);
  const remoteSpeechContext = useRef<AudioContext | null>(null);
  const pendingOffer = useRef<RTCSessionDescriptionInit | null>(null);
  const pendingAnswer = useRef<RTCSessionDescriptionInit | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const offerSent = useRef(false);
  const roleRef = useRef<CallRole>(null);
  const peerJoined = useRef(false);
  const localUserId = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `guest-${Date.now()}`
  );
  const localDisplayName = useMemo(() => {
    return (
      localIdentity?.name ||
      loggedInUser?.displayName ||
      loggedInUser?.email?.split("@")[0] ||
      "You"
    );
  }, [localIdentity?.name, loggedInUser?.displayName, loggedInUser?.email]);
  const localPhotoUrl = localIdentity?.photoUrl || loggedInUser?.photoURL || "";
  const channelName = `presence-video-${roomId}`;

  useEffect(() => {
    let isMounted = true;

    const loadLocalIdentity = async () => {
      if (!loggedInUser?.uid) {
        return;
      }

      let photoUrl = loggedInUser.photoURL || "";

      const response = await getUserInfo(loggedInUser.uid);
      if (response.success) {
        const userInfo = response.data as UserData;
        photoUrl = userInfo.profilePic || photoUrl;
      }

      if (!isMounted) {
        return;
      }

      setLocalIdentity({
        name: loggedInUser.displayName || loggedInUser.email?.split("@")[0] || "You",
        photoUrl: photoUrl || undefined,
      });
    };

    void loadLocalIdentity();

    return () => {
      isMounted = false;
    };
  }, [loggedInUser?.uid, loggedInUser?.displayName, loggedInUser?.email, loggedInUser?.photoURL]);

  useEffect(() => {
    return () => {
      if (localSpeechFrame.current !== null) {
        cancelAnimationFrame(localSpeechFrame.current);
      }
      if (remoteSpeechFrame.current !== null) {
        cancelAnimationFrame(remoteSpeechFrame.current);
      }
      void localSpeechContext.current?.close();
      void remoteSpeechContext.current?.close();
    };
  }, []);

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
          user_id: loggedInUser?.uid || localUserId.current,
          user_name: localDisplayName,
          user_image_url: localPhotoUrl,
        },
      },
    });

    const monitorSpeech = (
      stream: MediaStream,
      setSpeaking: (speaking: boolean) => void,
      contextRef: { current: AudioContext | null },
      frameRef: { current: number | null }
    ) => {
      const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextCtor) {
        return;
      }

      void contextRef.current?.close();
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      const audioContext = new AudioContextCtor();
      contextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      const values = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(values);
        const average = values.reduce((sum, value) => sum + value, 0) / values.length;
        setSpeaking(average > 18);
        frameRef.current = requestAnimationFrame(tick);
      };

      tick();
    };

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
          const members = (channel as unknown as { members?: { members?: Record<string, { info?: { user_name?: string; user_image_url?: string } }> } })?.members?.members;
          const remoteMember = members ? Object.values(members).find((member) => member.info?.user_name !== localDisplayName) : undefined;

          roleRef.current = nextRole;
          setRole(nextRole);
          setParticipantCount(count);
          if (remoteMember?.info) {
            setRemoteIdentity({
              name: remoteMember.info.user_name || "Participant",
              photoUrl: remoteMember.info.user_image_url || undefined,
            });
          }
          peerJoined.current = count > 1;
          setStatus(count > 1 ? "Connected. Joining call..." : "Waiting for another participant...");

          void startCallerOffer();
        });

        channel.bind("pusher:member_added", (...args: unknown[]) => {
          const member = args[0] as { info?: { user_name?: string; user_image_url?: string } } | undefined;
          const count = channel?.members?.count ?? 0;
          setParticipantCount(count);
          peerJoined.current = count > 1;

          if (member?.info?.user_name) {
            setRemoteIdentity({
              name: member.info.user_name,
              photoUrl: member.info.user_image_url || undefined,
            });
          }

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
        setLocalStreamState(stream);
        if (mode === "voice") {
          monitorSpeech(stream, setLocalSpeaking, localSpeechContext, localSpeechFrame);
        }
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !isMuted;
        });
        stream.getVideoTracks().forEach((track) => {
          track.enabled = isCameraOn;
        });
        if (mode === "video" && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        } else if (mode === "voice" && localAudioRef.current) {
          localAudioRef.current.srcObject = stream;
        }

        pc.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        stream.getTracks().forEach((track) => {
          pc.current?.addTrack(track, stream);
        });

        pc.current.ontrack = (event) => {
          setRemoteStreamState(event.streams[0]);

          if (mode === "voice") {
            monitorSpeech(event.streams[0], setRemoteSpeaking, remoteSpeechContext, remoteSpeechFrame);
          }

          if (mode === "video" && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          } else if (mode === "voice" && remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
            void remoteAudioRef.current.play().catch(() => {
              // Autoplay can still be blocked by the browser until the user interacts.
            });
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-slate-900">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-900">{status}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Room {roomId} · {participantCount} participant{participantCount === 1 ? "" : "s"}
          {role ? ` · ${role}` : ""} · {mode === "video" ? "video" : "voice"} call
        </p>
      </div>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <p className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-600">
            You
          </p>
          {mode === "video" && isCameraOn && localStreamState ? (
            <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          ) : (
            <>
              <audio ref={localAudioRef} autoPlay muted playsInline className="hidden" />
              <div className="flex h-80 min-h-[320px] flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200 text-sm text-slate-500">
                <UserAvatar
                  userImageUrl={localPhotoUrl || undefined}
                  userName={localDisplayName}
                  className="h-28 w-28 border-slate-200 bg-white text-xl shadow-sm"
                />
                <div className="text-center">
                  <div className="font-medium text-slate-700">{localDisplayName}</div>
                  <div className="text-xs text-slate-500">{mode === "voice" ? "Voice call active" : "Camera off"}</div>
                  {(mode === "voice" ? localSpeaking : !isCameraOn) ? (
                    <span className="mt-3 inline-flex items-center rounded-full border border-cyan-100 bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-[length:200%_100%] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white [animation:shimmer-sweep_1.3s_linear_infinite]">
                      Speaking
                    </span>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <p className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-600">
            Remote
          </p>
          {mode === "video" && remoteStreamState?.getVideoTracks().length ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
          ) : (
            <>
              <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
              <div className="flex h-80 min-h-[320px] flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200 text-sm text-slate-500">
                <UserAvatar
                  userImageUrl={remoteIdentity?.photoUrl}
                  userName={remoteIdentity?.name || "Participant"}
                  className="h-28 w-28 border-slate-200 bg-white text-xl shadow-sm"
                />
                <div className="text-center">
                  <div className="font-medium text-slate-700">{remoteIdentity?.name || "Remote participant"}</div>
                  <div className="text-xs text-slate-500">{mode === "voice" ? "Voice call active" : "Camera off"}</div>
                  {mode === "voice" && remoteSpeaking ? (
                    <span className="mt-3 inline-flex items-center rounded-full border border-cyan-100 bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-[length:200%_100%] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white [animation:shimmer-sweep_1.3s_linear_infinite]">
                      Speaking
                    </span>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setIsMuted((current) => !current)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button
          type="button"
          onClick={() => setIsCameraOn((current) => !current)}
          disabled={mode === "voice"}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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