'use client';

import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/DashboardHeader';

interface Hymn {
  id: string;
  title: string;
  author: string;
  theme: string;
  first_line: string;
  lyrics_preview: string;
}

export default function HymnFinderPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [scriptureRef, setScriptureRef] = useState('');
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string>('');

  const fetchHymns = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (searchTerm) params.append('query', searchTerm);
      if (selectedTheme !== 'all') params.append('theme', selectedTheme);
      if (scriptureRef) params.append('scripture', scriptureRef);

      const response = await fetch(`/api/hymns?${params.toString()}`);
      const data = await response.json();
      setHymns(data.hymns || []);
      setSource(data.source || '');
    } catch (err) {
      console.error('Failed to fetch hymns');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHymns();
  };

  const handleSaveHymn = async (hymn: Hymn) => {
    try {
      const response = await fetch('/api/user-hymns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hymn_id: hymn.id,
          title: hymn.title,
          author: hymn.author,
          first_line: hymn.first_line,
          lyrics: hymn.lyrics_preview,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save hymn');
      }

      const data = await response.json();

      if (data.success) {
        alert('Hymn saved to your Notes! Check the Notes page to view it.');
      } else {
        throw new Error('Save failed');
      }
    } catch (err: any) {
      console.error('Save hymn error:', err);
      alert('Failed to save hymn: ' + (err.message || 'Unknown error'));
    }
  };

  const themes = ['all', 'praise', 'worship', 'christmas', 'easter', 'salvation', 'grace'];

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-cream)' }}>
      {/* Shared Header with purple color scheme */}
      <DashboardHeader
        showBackLink
        pageTitle="Hymn Finder"
        pageIcon="🎵"
        colorScheme="purple"
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Hymns
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or lyrics..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scripture Reference
                </label>
                <input
                  type="text"
                  value={scriptureRef}
                  onChange={(e) => setScriptureRef(e.target.value)}
                  placeholder="e.g., Psalm 23 or John 3:16"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Searches Hymnary.org database</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Theme
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {themes.map(theme => (
                    <option key={theme} value={theme}>
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-pink-700 transition disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search Hymns'}
              </button>
            </div>
          </form>
          {source && (
            <p className="text-xs text-gray-500 mt-3">
              {source === 'hymnary' ? '✓ Results from Hymnary.org (100,000+ hymns)' :
               source === 'ai' ? '✓ AI-suggested hymns (search database or Hymnary.org for more)' :
               '✓ Results from local database'}
            </p>
          )}
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            <p className="mt-4 text-gray-600">Loading hymns...</p>
          </div>
        )}

        {!loading && hymns.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Click "Search Hymns" to find hymns by title, scripture reference, or theme</p>
          </div>
        )}

        {!loading && hymns.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Showing {hymns.length} hymn{hymns.length !== 1 ? 's' : ''}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hymns.map((hymn, index) => (
                <div key={`${hymn.id}-${index}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {hymn.title}
                    </h3>
                    <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                      {hymn.theme}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">By {hymn.author}</p>
                  <p className="text-sm italic text-gray-500 mb-4 line-clamp-3">
                    "{hymn.lyrics_preview}"
                  </p>
                  <button
                    onClick={() => handleSaveHymn(hymn)}
                    className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-pink-700 transition"
                  >
                    Save to Notes
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
