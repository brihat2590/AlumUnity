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
    } catch (err: any) {
      toast.error(err.message || 'Sign up failed.');
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
      <p className="text-gray-600 mb-6">
        Join a growing network of learners, leaders, and legacy makers.
      </p>

      <div className="space-y-3">
        <AuthButton provider="google" type="signup" onClick={handleGoogleSignup} />
        <AuthButton provider="github" type="signup" onClick={handleGithubSignup} />

        <div className="relative my-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="enter password"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 8 characters long with a number and a symbol.
            </p>
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-1"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800">
                Privacy Policy
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium transition-transform hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>

      <p className="text-sm text-gray-600 text-center mt-4">
        Already have an account?{' '}
        <Link href="/sign-in" className="text-blue-600 hover:text-blue-800 font-medium">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignUp;
