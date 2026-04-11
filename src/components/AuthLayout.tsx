import React, { ReactNode } from 'react';
import { Inter, Manrope } from 'next/font/google';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-headline',
});

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div
      className={`${inter.variable} ${manrope.variable} relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white p-6 text-slate-900 md:flex-row`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-indigo-100/80 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-slate-100 blur-3xl"></div>
      </div>

      <div className="relative flex w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-100 bg-white/95 shadow-2xl shadow-slate-900/5 md:max-w-4xl md:flex-row">
        {/* Decorative side panel - only visible on md and up */}
        <div className="relative hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-600 p-12 text-white md:block md:w-1/2">
          <div className="absolute -right-20 top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute -bottom-14 left-8 h-40 w-40 rounded-full bg-indigo-300/20 blur-2xl"></div>
          <div className="h-full flex flex-col justify-center">
            <h2 className="mb-6 font-headline text-4xl font-extrabold leading-tight">Welcome to AlumUnity</h2>
            <p className="mb-8 max-w-sm text-base text-white/80">
              Where connections never fade and opportunities never end.
            </p>
            <div className="space-y-4">
              <div className="flex items-start rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-sm">
                <div className="mr-3 rounded-full bg-white/20 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <p className="text-sm text-white/90">Connect with alumni from your University</p>
              </div>
              <div className="flex items-start rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-sm">
                <div className="mr-3 rounded-full bg-white/20 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <p className="text-sm text-white/90">Find mentorship and guidance for your career</p>
              </div>
              <div className="flex items-start rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-sm">
                <div className="mr-3 rounded-full bg-white/20 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                  </svg>
                </div>
                <p className="text-sm text-white/90">Discover exclusive events and opportunities</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Auth form section */}
        <div className="w-full p-8 md:w-1/2 md:p-10">
          
          <h2 className="mb-6 font-headline text-3xl font-extrabold tracking-tight text-slate-900">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;