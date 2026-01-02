'use client';

import { useState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/app/auth/login/actions';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await loginAction({
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // If successful, loginAction will redirect to dashboard
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-cream)' }}>
      {/* Liturgical Purple Gradient Header */}
      <div className="liturgical-gradient shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#FFFFFF' }}>
                Scripture Study Companion
              </h1>
            </div>
            <div className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
              <span className="text-5xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>📖</span>
            </div>
          </div>
        </div>
      </div>

      {/* Login Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md border-l-4 p-10" style={{ borderColor: 'var(--purple-deep)' }}>
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif', color: 'var(--purple-deep)' }}>
              Sign In
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-medium)' }}>
              Welcome back to your personal guide for deeper Scripture study
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-lg font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-lg transition-all duration-200 text-lg"
                style={{ border: '2px solid var(--border-gray)', outline: 'none' }}
                placeholder="klatt42@gmail.com"
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--purple-deep)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(91, 44, 111, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-gray)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-lg font-semibold" style={{ color: 'var(--text-dark)' }}>
                  Password
                </label>
                <Link href="/reset-password" className="text-lg font-medium" style={{ color: 'var(--purple-deep)' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-lg transition-all duration-200 text-lg"
                style={{ border: '2px solid var(--border-gray)', outline: 'none' }}
                placeholder="••••••••"
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--purple-deep)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(91, 44, 111, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-gray)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-4 px-6 rounded-lg font-bold text-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--purple-deep)' }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'var(--purple-medium)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(91, 44, 111, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--purple-deep)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t-2" style={{ borderColor: 'var(--border-gray)' }}></div>
            <span className="px-4 text-lg" style={{ color: 'var(--text-light)' }}>or</span>
            <div className="flex-1 border-t-2" style={{ borderColor: 'var(--border-gray)' }}></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-lg" style={{ color: 'var(--text-medium)' }}>
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="font-bold text-xl"
                style={{ color: 'var(--purple-deep)' }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
