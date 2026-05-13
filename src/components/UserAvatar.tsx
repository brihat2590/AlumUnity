import { cn } from "@/lib/utils";

type UserAvatarProps = {
  userImageUrl?: string;
  userName: string;
  className?: string;
};

const getInitials = (userName: string) => {
  const initials = userName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "?";
};

const UserAvatar = ({ userImageUrl, userName, className }: UserAvatarProps) => {
  const hasImage = Boolean(userImageUrl);
  const initials = getInitials(userName);

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700",
        className
      )}
    >
      {hasImage ? (
        <img src={userImageUrl} alt={userName} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
};

export default UserAvatar;

