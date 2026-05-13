"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Video, Mic, UserRound, Loader2, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFirebase } from "@/firebase/firebase.config";
import { getAllUsers } from "@/firebase/user.controller";
import { buildCallRoomId, CallMode } from "@/lib/call";
import { toast } from "sonner";

type CallUser = UserData & {
  id: string;
  email?: string;
};

export default function CallPage() {
  const router = useRouter();
  const { loggedInUser } = useFirebase();
  const [users, setUsers] = useState<CallUser[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      setLoading(true);
      const response = await getAllUsers();

      if (!isMounted) {
        return;
      }

      if (response.success) {
        setUsers((response.data || []) as CallUser[]);
      } else {
        toast.error(response.message || "Failed to load users.");
      }

      setLoading(false);
    };

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleUsers = useMemo(() => {
    const currentUid = loggedInUser?.uid;
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      if (user.id === currentUid) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchTarget = [user.name, user.email, user.batch, user.Education, user.Role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchTarget.includes(normalizedQuery);
    });
  }, [loggedInUser?.uid, query, users]);

  const startCall = (targetUserId: string, mode: CallMode) => {
    if (!loggedInUser?.uid) {
      toast.error("You need to be signed in to start a call.");
      return;
    }

    const roomId = buildCallRoomId(loggedInUser.uid, targetUserId);
    router.push(`/call/${roomId}?mode=${mode}`);
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col gap-8 rounded-[2rem] bg-slate-50 px-4 py-6 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/15 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600">
              <PhoneCall className="h-3.5 w-3.5" />
              Calls
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Start a voice or video call with any verified user.
            </h1>
            <p className="max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Pick a user from the Firebase directory, choose a call mode, and jump into a private room.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 sm:min-w-[260px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Available</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{visibleUsers.length}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Signed in</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{loggedInUser ? "Yes" : "No"}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, batch, or role"
            className="border-0 bg-transparent p-0 shadow-none outline-none ring-0 focus-visible:ring-0"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex h-64 items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        ) : visibleUsers.length > 0 ? (
          visibleUsers.map((user) => {
            const displayName = user.name || user.email || "Unknown user";
            const subtitle = [user.batch, user.Education].filter(Boolean).join(" • ");

            return (
              <article
                key={user.id}
                className="group flex flex-col rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 ring-1 ring-indigo-500/10">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      <UserRound className="h-7 w-7" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold text-slate-900">{displayName}</h2>
                    <p className="truncate text-sm text-slate-500">{user.email || user.id}</p>
                    {subtitle ? <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{subtitle}</p> : null}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {user.Role ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {user.Role}
                    </span>
                  ) : null}
                  {user.skills?.slice(0, 2).map((skill) => (
                    <span key={skill} className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-600">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button onClick={() => startCall(user.id, "voice")} variant="outline" className="gap-2 rounded-full">
                    <Mic className="h-4 w-4" />
                    Voice
                  </Button>
                  <Button onClick={() => startCall(user.id, "video")} className="gap-2 rounded-full">
                    <Video className="h-4 w-4" />
                    Video
                  </Button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="col-span-full rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
            No other users found in the Firebase directory.
          </div>
        )}
      </section>
    </main>
  );
}