import pusher from "@/lib/pusher";
import { NextResponse } from "next/server";

async function parseRequestBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}

export async function POST(request: Request) {
  const body = (await parseRequestBody(request)) as Record<string, string | undefined>;
  const socketId = body.socketId ?? body.socket_id;
  const channelName = body.channelName ?? body.channel_name;
  const userId = body.user_id ?? body.userId ?? `guest-${crypto.randomUUID()}`;

  if (!socketId || !channelName) {
    return NextResponse.json(
      { success: false, message: "Missing socket or channel details" },
      { status: 400 }
    );
  }

  const authData = channelName.startsWith("presence-")
    ? {
        user_id: userId,
        user_info: {
          user_id: userId,
        },
      }
    : undefined;

  const authResponse = pusher.authenticate(socketId, channelName, authData);
  return NextResponse.json(authResponse);
}