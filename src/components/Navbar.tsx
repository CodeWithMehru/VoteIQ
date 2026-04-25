'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { user, loginWithGoogle, logout } = useAuth();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform">
                V
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                VoteIQ
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {user?.role === 'staff' && (
              <Link 
                href="/dashboard"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Dashboard
              </Link>
            )}
            
            {user ? (
              <button 
                onClick={logout}
                className="text-sm font-medium px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors dark:text-white"
              >
                Sign Out
              </button>
            ) : (
              <button 
                onClick={loginWithGoogle}
                className="text-sm font-medium px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Staff Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
