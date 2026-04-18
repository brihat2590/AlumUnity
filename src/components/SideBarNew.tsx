'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase/firebase.config';
import { getUserInfo } from '@/firebase/user.controller';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Briefcase,
  User,
  LogOut,
  ChevronLeft,
  Zap,
  Menu,
  X,
} from 'lucide-react';

type MenuItem = {
  icon: React.ElementType;
  label: string;
  path: string;
};

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Calendar, label: 'Events', path: '/events' },
  { icon: MessageSquare, label: 'Forums', path: '/forums' },
  { icon: Briefcase, label: 'Opportunities', path: '/oppertunities' },
  { icon: User, label: 'Profile', path: '/profile' },
  {icon:Zap,label:"Resume review",path:"/resumereview"}
  // { icon: User, label: 'Video Chat', path: '/videochat' },
];

type SidebarNewProps = {
  onCollapseChange?: (isCollapsed: boolean) => void;
};

export function SidebarNew({ onCollapseChange }: SidebarNewProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const pathname = usePathname();
  const { logOut, loggedInUser } = useFirebase();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  useEffect(() => {
    let isMounted = true;
    if (loggedInUser?.uid) {
      getUserInfo(loggedInUser.uid).then((res) => {
        if (isMounted) {
          if (res?.success && res.data) {
            setProfilePic((res.data as any).profilePic || loggedInUser.photoURL || null);
          } else {
            setProfilePic(loggedInUser.photoURL || null);
          }
        }
      });
    } else {
      setProfilePic(null);
    }
    return () => {
      isMounted = false;
    };
  }, [loggedInUser]);

  // console.log(loggedInUser)
  //loggedInUser.displayName loggedInUser.email
  //loggedInUser.photoURL

  // logout is working

  const logoutHandler = async () => {
    try {
      await logOut();
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  // console.log("the photo url is ",loggedInUser?.photoURL)

  return (
    <>
      <button
        type="button"
        aria-label="Open sidebar"
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-100 md:hidden"
      >
        <Menu className="h-5 w-5 z-40" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          aria-label="Close sidebar overlay"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-dvh shrink-0 flex-col border-r border-slate-200 bg-white/80 backdrop-blur-xl transition-all duration-300 ease-in-out md:z-30',
          isMobileOpen ? 'translate-x-0 cursor-default' : '-translate-x-full',
          'md:translate-x-0',
          isCollapsed ? 'w-[80px]' : 'w-[260px]',
          'shadow-sm'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200/60 px-4">
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center gap-3 transition-opacity duration-300',
              isCollapsed && 'mx-auto'
            )}
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl text-indigo-600 ">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-semibold tracking-tight text-slate-900">AlumUnity</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Connect &bull; Collaborate
                </span>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="hidden h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-500 transition-colors hover:bg-slate-100 md:inline-flex"
            aria-label="Toggle sidebar collapse"
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform duration-300', isCollapsed && 'rotate-180')}
            />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-500 transition-colors hover:bg-slate-100 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 py-4 custom-scrollbar">
          <nav className="flex flex-col gap-1.5">
            {menuItems.map(({ icon: Icon, label, path }) => {
              const isActive = pathname === path;
              return (
                <Link href={path} key={label} className="outline-none">
                  <div
                    className={cn(
                      'group relative flex h-10 items-center rounded-lg px-3 transition-all duration-200',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm ring-1 ring-inset ring-indigo-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      isCollapsed && 'justify-center px-0'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors duration-200',
                        isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                      )}
                    />
                    {!isCollapsed && (
                      <span className="ml-3 truncate text-sm">{label}</span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-white opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 whitespace-nowrap z-50 shadow-md">
                        {label}
                        <div className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="mt-auto border-t border-slate-200/60 p-3">
          <div
            className={cn(
              'flex items-center rounded-xl bg-slate-50 p-2 border border-slate-100 transition-all duration-300',
              isCollapsed ? 'justify-center flex-col gap-2 bg-transparent border-none p-0' : 'gap-3 mb-2'
            )}
          >
            <div className="relative shrink-0">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="User avatar"
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-sm font-semibold text-indigo-700 ring-2 ring-white shadow-sm">
                  {loggedInUser?.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                </div>
              )}
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
            </div>

            {!isCollapsed && (
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden leading-tight">
                <span className="truncate text-sm font-semibold text-slate-900">
                  {loggedInUser?.displayName || 'User Account'}
                </span>
                <span className="truncate text-xs text-slate-500">
                  {loggedInUser?.email}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={logoutHandler}
            className={cn(
              'w-full group relative flex h-10 items-center justify-center rounded-lg transition-all duration-200 text-slate-600 hover:bg-red-50 hover:text-red-600',
              !isCollapsed && 'justify-start px-3'
            )}
          >
            <LogOut className="h-5 w-5 shrink-0 transition-colors duration-200 text-slate-400 group-hover:text-red-500" />
            {!isCollapsed && <span className="ml-3 text-sm font-medium">Log out</span>}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-white opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 whitespace-nowrap z-50 shadow-md">
                Log out
                <div className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
