import { redirect } from "next/navigation";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ roomId }, { mode }] = await Promise.all([params, searchParams]);

  redirect(`/call/${roomId}${mode ? `?mode=${mode}` : ""}`);
}