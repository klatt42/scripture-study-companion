'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Profile {
  full_name: string | null;
  study_group: string | null;
}

interface DashboardHeaderProps {
  showBackLink?: boolean;
  backLinkHref?: string;
  backLinkText?: string;
  pageTitle?: string;
  pageIcon?: string;
  colorScheme?: 'purple' | 'green' | 'gold' | 'crimson' | 'blue';
  rightContent?: React.ReactNode;
}

const colorSchemes = {
  purple: {
    gradient: 'linear-gradient(135deg, var(--purple-deep) 0%, var(--purple-medium) 50%, var(--purple-light) 100%)',
    className: 'liturgical-gradient',
  },
  green: {
    gradient: 'linear-gradient(135deg, var(--green-liturgical) 0%, var(--green-sage) 100%)',
    className: '',
  },
  gold: {
    gradient: 'linear-gradient(135deg, var(--amber) 0%, var(--gold) 100%)',
    className: '',
  },
  crimson: {
    gradient: 'linear-gradient(135deg, var(--crimson) 0%, #B22222 100%)',
    className: '',
  },
  blue: {
    gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
    className: '',
  },
};

export default function DashboardHeader({
  showBackLink = false,
  backLinkHref = '/dashboard',
  backLinkText = '← Dashboard',
  pageTitle,
  pageIcon,
  colorScheme = 'purple',
  rightContent,
}: DashboardHeaderProps) {
  const [profile, setProfile] = useState<Profile>({
    full_name: null,
    study_group: null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.profile) {
        setProfile({
          full_name: data.profile.full_name || null,
          study_group: data.profile.study_group || null,
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile for header:', err);
    }
  };

  // Extract first name for display
  const firstName = profile.full_name?.split(' ')[0];
  const displayName = firstName ? `Welcome, ${firstName}` : "Scripture Study Companion";

  const scheme = colorSchemes[colorScheme];

  return (
    <header
      className={`shadow-md ${scheme.className}`}
      style={!scheme.className ? { background: scheme.gradient } : undefined}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Mobile Layout (stacked) */}
        <div className="flex sm:hidden items-center justify-between py-2">
          {/* Left: Back button or title */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {showBackLink && (
              <Link
                href={backLinkHref}
                className="text-white/90 hover:text-white transition-colors text-sm font-medium shrink-0"
              >
                ← Back
              </Link>
            )}
            {pageTitle && (
              <h1 className="text-base font-bold text-white truncate" style={{ fontFamily: 'Georgia, serif' }}>
                {pageIcon && <span className="mr-1">{pageIcon}</span>}
                {pageTitle}
              </h1>
            )}
            {!pageTitle && !showBackLink && (
              <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
                Scripture Study
              </h1>
            )}
          </div>

          {/* Center: Book icon (smaller on mobile) */}
          <div className="shrink-0 px-2">
            <span className="text-2xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>📖</span>
          </div>

          {/* Right: Action button */}
          <div className="flex items-center justify-end shrink-0">
            {rightContent ? (
              rightContent
            ) : showBackLink ? (
              <Link
                href="/dashboard"
                className="text-sm text-white/90 hover:text-white font-medium px-2 py-1 rounded bg-white/10"
              >
                Home
              </Link>
            ) : (
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm text-white/90 hover:text-white font-medium px-2 py-1 rounded bg-white/10"
                >
                  Sign Out
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Desktop Layout (3-column grid) */}
        <div className="hidden sm:grid grid-cols-3 items-center h-16">
          {/* Left side */}
          <div className="flex items-center gap-3 min-w-0">
            {showBackLink && (
              <Link
                href={backLinkHref}
                className="text-white/80 hover:text-white transition-colors flex items-center gap-1 shrink-0"
              >
                <span>←</span> Back
              </Link>
            )}
            {pageTitle ? (
              <div className="flex items-center gap-2 min-w-0">
                {pageIcon && <span className="text-2xl shrink-0">{pageIcon}</span>}
                <h1 className="text-lg lg:text-xl font-bold text-white truncate" style={{ fontFamily: 'Georgia, serif' }}>
                  {pageTitle}
                </h1>
              </div>
            ) : (
              <h1 className="text-lg lg:text-xl font-bold truncate" style={{ fontFamily: 'Georgia, serif', color: '#FFFFFF' }}>
                Scripture Study Companion
              </h1>
            )}
          </div>

          {/* Center - Book icon */}
          <div className="flex items-center justify-center">
            <span className="text-4xl lg:text-5xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>📖</span>
          </div>

          {/* Right side */}
          <div className="flex items-center justify-end gap-4 lg:gap-6">
            <div className="text-right hidden md:block">
              <span className="text-base lg:text-lg text-white font-medium block" style={{ fontFamily: 'Georgia, serif' }}>
                {displayName}
              </span>
              {profile.study_group && (
                <span className="text-xs lg:text-sm text-white/80 truncate max-w-[200px] block" style={{ fontFamily: 'Georgia, serif' }}>
                  {profile.study_group}
                </span>
              )}
            </div>
            {rightContent ? (
              rightContent
            ) : showBackLink ? (
              <Link
                href={backLinkHref}
                className="text-sm lg:text-base text-white/90 hover:text-white transition-colors duration-150 font-medium"
              >
                {backLinkText}
              </Link>
            ) : (
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm lg:text-base text-white/90 hover:text-white transition-colors duration-150 font-medium"
                >
                  Sign Out
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
