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
    } catch (err: any) {
      toast.error(err.message || 'Sign in failed');
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
      <p className="text-gray-600 mb-8">
        Welcome back to AlumUnity – where connections never fade.
      </p>

      <div className="space-y-4">
        <AuthButton provider="google" type="signin" onClick={handleGoogleLogin} />
        <AuthButton provider="github" type="signin" onClick={handleGithubLogin} />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <a href="#" className="text-xs text-blue-600 hover:text-blue-800">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium transition-transform hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>

      <p className="text-sm text-gray-600 text-center mt-8">
        Don't have an account?{' '}
        <Link href="/sign-up" className="text-blue-600 hover:text-blue-800 font-medium">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignIn;
