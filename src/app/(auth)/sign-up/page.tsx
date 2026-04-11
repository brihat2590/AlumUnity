'use client';

import React, { useState } from 'react';
import AuthButton from '@/components/AuthButton';
import AuthLayout from '@/components/AuthLayout';
import Link from 'next/link';
import { useFirebase } from '@/firebase/firebase.config';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { signInWithGoogle, signInWithGithub, signUpWithEmail } = useFirebase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password);
      
      router.push('/sign-in');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    await signInWithGoogle();
    router.push('/dashboard');
  };

  const handleGithubSignup = async () => {
    await signInWithGithub();
    router.push('/dashboard');
  };

  return (
    <AuthLayout title="Create Account">
      <p className="mb-6 text-sm leading-relaxed text-slate-500">
        Join a growing network of learners, leaders, and legacy makers.
      </p>

      <div className="space-y-3">
        <AuthButton provider="google" type="signup" onClick={handleGoogleSignup} />
        <AuthButton provider="github" type="signup" onClick={handleGithubSignup} />

        <div className="relative my-4">
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
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="enter password"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Must be at least 8 characters long with a number and a symbol.
            </p>
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-slate-500">
              I agree to the{' '}
              <a href="#" className="font-medium text-indigo-500 transition-colors hover:text-indigo-600">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-indigo-500 transition-colors hover:text-indigo-600">
                Privacy Policy
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-indigo-500 px-4 py-3 font-headline text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-semibold text-indigo-500 transition-colors hover:text-indigo-600">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignUp;
