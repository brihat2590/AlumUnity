import VideoCall from "@/components/VideoCall";
import { normalizeCallMode } from "@/lib/call";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ roomId }, { mode }] = await Promise.all([params, searchParams]);

  return <VideoCall roomId={roomId} mode={normalizeCallMode(mode)} />;
}