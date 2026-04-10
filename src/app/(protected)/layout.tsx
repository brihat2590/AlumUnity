'use client';

import { SidebarNew } from '@/components/SideBarNew';
import { useFirebase } from '@/firebase/firebase.config';
import { useRouter } from 'next/navigation';
import React, { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { FaSpinner } from 'react-icons/fa';

const Layout = ({ children }: { children: ReactNode }) => {
  const { authloading, isUserLoggedIn } = useFirebase();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Redirect only after loading is complete and user is not logged in
    if (!authloading && !isUserLoggedIn) {
      router.replace('/sign-in');
    }
  }, [isUserLoggedIn, authloading, router]);

  // Prevent rendering until auth state is resolved
  if (authloading || (!authloading && !isUserLoggedIn)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-xl" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNew onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={cn(
          'hidden shrink-0 transition-all duration-300 md:block',
          isSidebarCollapsed ? 'w-[80px]' : 'w-[250px]'
        )}
      />

      <main className="flex-1 overflow-auto bg-gray-50 p-4 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default Layout;
