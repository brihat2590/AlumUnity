'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase/firebase.config';
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
  const pathname = usePathname();
  const { logOut, loggedInUser } = useFirebase();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);
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
        className="fixed left-3 top-3 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

    <aside
      className={cn(
        'fixed left-0 top-0 z-50 flex min-h-screen w-[250px] shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white transition-all duration-300 md:z-30',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0',
        isCollapsed ? 'md:w-[80px]' : 'md:w-[250px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <div className="flex items-center flex-1">
          <div className="w-8 h-8 rounded flex items-center justify-center mr-3 relative overflow-hidden">
            {/* <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 relative z-10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path className="text-purple-600" d="M12 2L3 9l9 7 9-7-9-7z" />
              <path className="text-purple-500" d="M3 9v7l9 7 9-7V9" />
              <path className="text-purple-400" d="M12 16l-9-7 9-7 9 7-9 7z" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 animate-[glow_3s_ease-in-out_infinite]" /> */}
            <div className="relative flex items-center justify-center">
              <Zap 
                className="h-8 w-8 text-indigo-600 animate-pulse z-10" 
                strokeWidth={2.5} 
              />
              <div className="absolute h-8 w-8 bg-indigo-500/20 rounded-full blur-md animate-pulse" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <h1 className="font-semibold text-xl">AlumUnity</h1>
              <p className="text-sm text-gray-500">Connect • Collaborate</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="hidden h-8 w-8 items-center justify-center rounded-md border border-transparent text-gray-700 transition-colors hover:bg-gray-100 md:inline-flex"
          aria-label="Toggle sidebar collapse"
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')}
          />
        </button>
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        {menuItems.map(({ icon: Icon, label, path }) => (
          <Link href={path} key={label}>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'my-2 mb-2 w-full justify-start gap-3 border-transparent bg-transparent',
                !isCollapsed ? 'px-4' : 'px-0 justify-center',
                pathname === path
                  ? 'bg-gradient-to-r from-purple-500/10 to-purple-600/10 text-purple-700'
                  : 'hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-purple-600/10 hover:text-purple-700  '
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  pathname === path ? 'text-purple-600' : 'text-gray-500'
                )}
              />
              {!isCollapsed && <span>{label}</span>}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Footer */}

      
        <div className="border-t p-2 ">
          <div
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'space-x-3'
            } mb-4 transition-all duration-150`}
          >
            {loggedInUser?.photoURL ? (
              <img
                src={loggedInUser.photoURL}
                alt="User avatar"
                className="w-10 h-10 rounded-full object-cover transition-all duration-150"
              />
            ) : (
              <button
                className="w-10 h-10 rounded-full bg-white text-blue-600 font-bold text-lg flex items-center justify-center border border-blue-200 shadow-sm hover:shadow-md hover:ring-2 hover:ring-blue-400/50 transition-all duration-200"
                aria-label="User"
                title={loggedInUser?.email || 'User'}
              >
                {loggedInUser?.email?.split('@')[0]?.charAt(0).toUpperCase()}
              </button>

            )}
            <div
              className={`${
                isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'
              } transition-all duration-150 ease-linear overflow-hidden`}
            >
              
              <p className="text-sm text-gray-500 truncate">{loggedInUser?.email}</p>
            </div>
          </div>
        </div>

      <div className="p-2 border-t border-gray-200">
        <Button
          variant="outline"
          size="sm"
          onClick={logoutHandler}
          className={cn(
            'w-full justify-start gap-3 border-transparent bg-transparent',
            !isCollapsed ? 'px-4' : 'px-0 justify-center',
            pathname === '/logout'
              ? 'bg-gradient-to-r from-purple-500/10 to-purple-600/10 text-purple-700'
                : 'hover:bg-gradient-to-r hover:from-red-600/10 hover:to-red-700/10 hover:text-purple-700'
          )}
        >
          <LogOut
            className={cn(
              'h-5 w-5',
              pathname === '/logout' ? 'text-purple-600' : 'text-gray-500'
            )}
          />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
    </>
  );
}
