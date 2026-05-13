import pusher from "@/lib/pusher";
import { NextResponse } from "next/server";

const eventAliases: Record<string, string> = {
    "client-video-offer": "video-offer",
    "client-video-answer": "video-answer",
    "client-ice-candidate": "ice-candidate",
};

const allowedEvents = new Set(["video-offer", "video-answer", "ice-candidate"]);

export async function POST(req: Request) {
    const body = await req.json();
    const channelName = body.channelName ?? body.channel_name;
    const eventName = eventAliases[body.eventName ?? body.event_name] ?? body.eventName ?? body.event_name;
    const data = body.data;

    if (typeof channelName !== "string" || typeof eventName !== "string" || !allowedEvents.has(eventName)) {
        return NextResponse.json(
            { success: false, message: "Invalid signaling payload" },
            { status: 400 }
        );
    }

    await pusher.trigger(channelName, eventName, data);
    return NextResponse.json({ success: true });
}