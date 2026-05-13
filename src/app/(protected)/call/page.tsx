"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Calendar, Mic, PlusCircle, Users, Video } from "lucide-react";
import { useFirebase } from "@/firebase/firebase.config";
import { getAllUsers } from "@/firebase/user.controller";
import { buildCallRoomId, CallMode } from "@/lib/call";
import { toast } from "sonner";

type CallUser = UserData & {
  id: string;
  email?: string;
};

type CallDirectoryPerson = {
  id: string;
  name: string;
  roleLabel: string;
  classOf: string;
  education: string;
  skills: string[];
  userImageUrl?: string;
};

const getRoleLabel = (role?: Role) => role ?? "MEMBER";

const getClassOf = (batch?: string) => (batch ? `Class of ${batch}` : "Active Member");

const getInitials = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "?";
};

const getRoleTone = () => ({
  badge: "bg-slate-100 text-slate-500",
  accent: "text-slate-400",
  video: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
});

export default function CallPage() {
  const router = useRouter();
  const { loggedInUser } = useFirebase();
  const [users, setUsers] = useState<CallUser[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      const response = await getAllUsers();

      if (!isMounted) {
        return;
      }

      if (response.success) {
        setUsers((response.data || []) as CallUser[]);
      } else {
        toast.error(response.message || "Failed to load users.");
      }
    };

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const startCall = (targetUserId: string, mode: CallMode) => {
    if (!loggedInUser?.uid) {
      toast.error("You need to be signed in to start a call.");
      return;
    }

    const roomId = buildCallRoomId(loggedInUser.uid, targetUserId);
    router.push(`/call/${roomId}?mode=${mode}`);
  };

  const directoryPeople = useMemo<CallDirectoryPerson[]>(() => {
    return users
      .filter((user) => Boolean(user.name?.trim()) && user.id !== loggedInUser?.uid)
      .map((user) => ({
        id: user.id,
        name: user.name?.trim() || "",
        roleLabel: getRoleLabel(user.Role),
        classOf: getClassOf(user.batch),
        education: user.Education?.trim() || "Verified AlumUnity member",
        skills: (user.skills || []).filter(Boolean).slice(0, 3),
        userImageUrl: user.profilePic,
      }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [loggedInUser?.uid, users]);

  return (
    <main className="relative min-h-screen bg-[#fafafa] font-sans text-slate-700 selection:bg-slate-200 selection:text-slate-950">
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap');
        .call-studio-font {
          font-family: 'Satoshi', sans-serif;
        }
        @view-transition {
          navigation: auto;
        }
        ::view-transition-old(root) {
          animation: 0.3s ease-out both fade-out;
        }
        ::view-transition-new(root) {
          animation: 0.3s ease-in both fade-in;
        }
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div className="relative mx-auto max-w-[1200px] px-6 py-24 md:px-12">
        <header className="relative mb-28 text-center">
          

          <h1 className="call-studio-font mb-8 text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl lg:text-7xl">
            Meet in a more human way
          </h1>

          <p className="mx-auto max-w-2xl call-studio-font text-lg font-medium leading-relaxed text-slate-500">
            A simplified directory for focused communication. Minimal noise, maximum clarity.
          </p>
        </header>

        {directoryPeople.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {directoryPeople.map((person) => {
              const roleTone = getRoleTone();

              return (
                <div
                  key={person.id}
                  className="group rounded-3xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                    <div className="relative shrink-0">
                      <div className="h-24 w-24 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                        {person.userImageUrl ? (
                          <img
                            src={person.userImageUrl}
                            alt={person.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-50 text-3xl font-black text-slate-400">
                            {getInitials(person.name)}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm">
                        <BadgeCheck className="text-lg" aria-hidden="true" />
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <div className="mb-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <h2 className="call-studio-font text-2xl font-black tracking-tight text-slate-900">
                          {person.name}
                        </h2>
                        <span className={`inline-block self-center rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest sm:self-auto ${roleTone.badge}`}>
                          {person.roleLabel}
                        </span>
                      </div>
                      <p className={`mb-3 call-studio-font text-[11px] font-bold uppercase tracking-widest ${roleTone.accent}`}>
                        {person.classOf}
                      </p>
                      <p className="mb-4 call-studio-font text-sm font-medium leading-relaxed text-slate-500">
                        {person.education}
                      </p>

                      <div className="mb-6 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                        {person.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="rounded-lg border border-slate-100 bg-slate-50/50 px-2.5 py-1 text-[11px] font-bold text-slate-500 transition-colors hover:bg-slate-50"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => startCall(person.id, "voice")}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-xs font-black text-slate-700 transition-all hover:bg-slate-50"
                    >
                      <Mic className="text-base text-slate-400" aria-hidden="true" />
                      Voice
                    </button>
                    <button
                      type="button"
                      onClick={() => startCall(person.id, "video")}
                      className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-xs font-black text-white transition-all ${roleTone.video}`}
                    >
                      <Video className="text-base" aria-hidden="true" />
                      Video
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
            <Users className="mx-auto mb-6 h-12 w-12 text-slate-300" aria-hidden="true" />
            <h2 className="call-studio-font text-2xl font-black text-slate-900">Searching for peers...</h2>
            <p className="call-studio-font font-medium text-slate-500">New profiles appear as they go live.</p>
          </div>
        )}

        <section className="relative mt-40">
          <div className="relative rounded-[2.5rem] border border-slate-200 bg-white p-12 text-center shadow-sm md:p-20">
            <div className="relative z-10">
              <h3 className="call-studio-font mb-6 text-4xl font-black text-slate-900 md:text-5xl">
                Host your own discussion
              </h3>
              <p className="call-studio-font mx-auto mb-10 max-w-lg text-lg font-medium text-slate-500">
                Create a focused sanctuary for deep dives or schedule a session for later.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="#"
                  className="inline-flex items-center gap-3 rounded-xl bg-indigo-600 px-10 py-5 text-sm font-black text-white transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                >
                  <PlusCircle className="text-xl" aria-hidden="true" />
                  Start a New Session
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-10 py-5 text-sm font-black text-slate-700 transition-all hover:bg-slate-50"
                >
                  <Calendar className="text-xl text-slate-400" aria-hidden="true" />
                  Schedule for later
                </a>
              </div>
            </div>
          </div>
        </section>

        
      </div>
    </main>
  );
}