'use client';

import React, { useState } from 'react';
import AuthButton from '@/components/AuthButton';
import AuthLayout from '@/components/AuthLayout';
import Link from 'next/link';
import { useFirebase } from '@/firebase/firebase.config';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, signInWithGithub } = useFirebase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
    router.push('/dashboard');
  };

  const handleGithubLogin = async () => {
    await signInWithGithub();
    router.push('/dashboard');
  };

  return (
    <AuthLayout title="Sign In">
      <p className="mb-8 text-sm leading-relaxed text-slate-500">
        Welcome back to AlumUnity – where connections never fade.
      </p>

      <div className="space-y-4">
        <AuthButton provider="google" type="signin" onClick={handleGoogleLogin} />
        <AuthButton provider="github" type="signin" onClick={handleGithubLogin} />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <a href="#" className="text-xs font-medium text-indigo-500 transition-colors hover:text-indigo-600">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-indigo-500 px-4 py-3 font-headline text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="font-semibold text-indigo-500 transition-colors hover:text-indigo-600">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignIn;
