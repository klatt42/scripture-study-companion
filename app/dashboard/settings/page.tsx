'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader';

interface Settings {
  bible_version: string;
  email_notifications: boolean;
  calendar_reminders: boolean;
  community_notifications: boolean;
  font_size: string;
}

interface Profile {
  username: string;
  full_name: string;
  church_affiliation: string;
  denomination: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    bible_version: 'NIV',
    email_notifications: true,
    calendar_reminders: true,
    community_notifications: true,
    font_size: 'medium',
  });

  const [profile, setProfile] = useState<Profile>({
    username: '',
    full_name: '',
    church_affiliation: '',
    denomination: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  // Auto-dismiss messages after 4 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.settings) setSettings(data.settings);
      if (data.profile) setProfile(data.profile);
      if (data.email) setUserEmail(data.email);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, profile }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save settings');
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-cream)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-cream)' }}>
      {/* Shared Header - pulls profile from settings */}
      <DashboardHeader showBackLink backLinkHref="/dashboard" backLinkText="← Dashboard" />

      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif', color: 'var(--purple-deep)' }}>
          Settings
        </h2>
        <p className="text-lg" style={{ color: 'var(--text-medium)' }}>
          {profile.full_name
            ? `Customize ${profile.full_name.split(' ')[0]}'s Copilot experience`
            : "Customize your Pastor's Copilot experience"}
        </p>
      </div>

      {/* Toast Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          message.type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSaveSettings} className="space-y-8">

          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">👤</span>
              <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                Profile Information
              </h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Your full legal name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={profile.username || ''}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  placeholder="Your username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Church / Ministry
                </label>
                <input
                  type="text"
                  value={profile.church_affiliation || ''}
                  onChange={(e) => setProfile({ ...profile, church_affiliation: e.target.value })}
                  placeholder="e.g., First Presbyterian Church"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Denomination / Tradition
                </label>
                <select
                  value={profile.denomination || ''}
                  onChange={(e) => setProfile({ ...profile, denomination: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                >
                  <option value="">Select denomination...</option>
                  <option value="Anglican/Episcopal">Anglican / Episcopal</option>
                  <option value="Baptist">Baptist</option>
                  <option value="Catholic">Catholic</option>
                  <option value="Church of Christ">Church of Christ</option>
                  <option value="Congregational">Congregational</option>
                  <option value="Lutheran">Lutheran</option>
                  <option value="Methodist">Methodist</option>
                  <option value="Non-denominational">Non-denominational</option>
                  <option value="Orthodox">Orthodox</option>
                  <option value="Pentecostal">Pentecostal</option>
                  <option value="Presbyterian">Presbyterian</option>
                  <option value="Reformed">Reformed</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📖</span>
              <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                App Preferences
              </h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Bible Version
                </label>
                <select
                  value={settings.bible_version}
                  onChange={(e) => setSettings({ ...settings, bible_version: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                >
                  <option value="NIV">NIV (New International Version)</option>
                  <option value="ESV">ESV (English Standard Version)</option>
                  <option value="KJV">KJV (King James Version)</option>
                  <option value="NKJV">NKJV (New King James Version)</option>
                  <option value="NRSV">NRSV (New Revised Standard Version)</option>
                  <option value="NLT">NLT (New Living Translation)</option>
                  <option value="NASB">NASB (New American Standard Bible)</option>
                  <option value="RSV">RSV (Revised Standard Version)</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Used as the default translation in Bible Search
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Size
                </label>
                <select
                  value={settings.font_size}
                  onChange={(e) => setSettings({ ...settings, font_size: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium (Default)</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🔔</span>
              <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                Notifications
              </h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <span className="text-base text-gray-900 font-medium">Email Notifications</span>
                  <p className="text-sm text-gray-500">Receive updates about your sermons and notes</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <span className="text-base text-gray-900 font-medium">Calendar Reminders</span>
                  <p className="text-sm text-gray-500">Get reminders for upcoming events and sermon prep</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.calendar_reminders}
                  onChange={(e) => setSettings({ ...settings, calendar_reminders: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <span className="text-base text-gray-900 font-medium">Community Updates</span>
                  <p className="text-sm text-gray-500">Notifications from the pastor community (coming soon)</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.community_notifications}
                  onChange={(e) => setSettings({ ...settings, community_notifications: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>
            </div>
          </div>

          {/* Account Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🔐</span>
              <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                Account
              </h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Email Address</p>
                <p className="text-base font-medium text-gray-900">{userEmail || 'Not available'}</p>
              </div>
              <Link
                href="/reset-password"
                className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-800 font-medium"
              >
                Change Password
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 px-6 rounded-lg font-semibold text-lg text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: saving
                ? '#9CA3AF'
                : 'linear-gradient(135deg, var(--purple-deep) 0%, var(--purple-medium) 100%)',
            }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
