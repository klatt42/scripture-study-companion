'use client';

import { useState, useEffect } from 'react';

interface Profile {
  full_name: string | null;
}

export default function DashboardWelcome() {
  const [profile, setProfile] = useState<Profile>({
    full_name: null,
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
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  // Extract first name for display
  const firstName = profile.full_name?.split(' ')[0] || 'Friend';

  return (
    <div className="mb-10">
      <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif', color: 'var(--purple-deep)' }}>
        Welcome, {firstName}
      </h2>
      <p className="text-lg" style={{ color: 'var(--text-medium)' }}>
        Your personal guide to deeper Scripture study
      </p>
    </div>
  );
}
