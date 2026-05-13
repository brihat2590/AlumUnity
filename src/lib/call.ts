export type CallMode = "voice" | "video";

export function buildCallRoomId(firstUserId: string, secondUserId: string) {
  return [firstUserId, secondUserId].sort().join("__");
}

export function normalizeCallMode(value: string | undefined | null): CallMode {
  return value === "voice" ? "voice" : "video";
}