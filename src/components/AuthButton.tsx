import React from 'react';
import { Github } from 'lucide-react';

type AuthButtonProps = {
  provider: 'google' | 'github';
  type: 'signin' | 'signup';
  onClick?: () => Promise<void>; // ✅ accept optional onClick
};

const AuthButton: React.FC<AuthButtonProps> = ({ provider, type, onClick }) => {
  const isSignIn = type === 'signin';
  const action = isSignIn ? 'Sign in' : 'Sign up';
  const isGoogle = provider === 'google';

  return (
    <button
      onClick={onClick} // ✅ use the correct prop
      className={`mb-4 flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isGoogle
          ? 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-300'
          : 'bg-slate-900 text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 focus:ring-slate-400'
      }`}
      type="button"
    >
      {provider === 'google' ? (
        <svg
          className="w-5 h-5 mr-2"
          viewBox="0 0 533.5 544.3"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M533.5 278.4c0-17.4-1.4-34.1-4.1-50.3H272v95.2h146.9c-6.3 34.1-25.1 63-53.5 82.3v68h86.5c50.7-46.7 81.6-115.5 81.6-195.2z"
            fill="#4285f4"
          />
          <path
            d="M272 544.3c72.6 0 133.5-24 178-65.1l-86.5-68c-23.9 16.1-54.5 25.6-91.5 25.6-70.3 0-130-47.5-151.3-111.3H33.6v69.7c44.4 88.1 136.5 149.1 238.4 149.1z"
            fill="#34a853"
          />
          <path
            d="M120.7 325.5c-10.1-30.1-10.1-62.7 0-92.8v-69.7H33.6c-32.7 65.2-32.7 142.5 0 207.7l87.1-69.2z"
            fill="#fbbc04"
          />
          <path
            d="M272 107.7c39.4 0 74.7 13.6 102.6 40.2l76.9-76.9C405.5 26.3 344.6 0 272 0 170.1 0 78 60.9 33.6 149.1l87.1 69.7C142 155.2 201.7 107.7 272 107.7z"
            fill="#ea4335"
          />
        </svg>
      ) : (
        <Github className="w-5 h-5 mr-2" />
      )}
      {action} with {provider.charAt(0).toUpperCase() + provider.slice(1)}
    </button>
  );
};

export default AuthButton;
