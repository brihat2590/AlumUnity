'use client';

import { useFirebase } from '@/firebase/firebase.config';
import { useRouter } from 'next/navigation';
import React, { ReactNode, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';

const Layout = ({ children }: { children: ReactNode }) => {
  const { authloading, isUserLoggedIn } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in and auth has loaded, redirect them away from auth pages
    if (!authloading && isUserLoggedIn) {
      router.replace('/dashboard'); // Use replace to avoid back navigation to auth
    }
  }, [authloading, isUserLoggedIn, router]);

  // Prevent rendering until we know if the user is logged in or not
  if (authloading || (!authloading && isUserLoggedIn)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-xl" />
      </div>
    );
  }

  return <div>{children}</div>;
};

export default Layout;
