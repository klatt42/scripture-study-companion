'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';

interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
  compareText?: string;
  compareVersion?: string;
}

export default function BibleSearchPage() {
  const [query, setQuery] = useState('');
  const [version, setVersion] = useState('NIV');
  const [compareVersion, setCompareVersion] = useState('');
  const [enableComparison, setEnableComparison] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch('/api/bible-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          version,
          compareVersion: enableComparison ? compareVersion : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVerse = async (result: SearchResult) => {
    try {
      const verseContent = `# ${result.book} ${result.chapter}:${result.verse} (${result.version})

${result.text}

---
*Saved from Bible Search*`;

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${result.book} ${result.chapter}:${result.verse}`,
          content: verseContent,
          category: 'study',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save verse');
      }

      alert('Verse saved to your Notes!');
    } catch (err) {
      alert('Failed to save verse');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Shared Header with green color scheme */}
      <DashboardHeader
        showBackLink
        pageTitle="Bible Search"
        pageIcon="📖"
        colorScheme="green"
      />

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif', color: 'var(--green-liturgical)' }}>
            Search the Scriptures
          </h2>
          <p style={{ color: 'var(--text-medium)' }}>
            Search God's Word across multiple translations and compare versions side-by-side
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border-l-4 p-4 sm:p-6 mb-8" style={{ borderColor: 'var(--green-liturgical)' }}>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Mobile: Stacked layout */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  required
                  placeholder="e.g., Luke 18:1-8 or John 3:16"
                  className="w-full px-4 py-3 rounded-lg transition-all duration-200 text-base"
                  style={{ border: '1px solid var(--border-gray)', outline: 'none', fontSize: '16px' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--green-liturgical)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(45, 80, 22, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-gray)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="flex-1 sm:flex-none sm:w-28 px-3 py-3 rounded-lg transition-all duration-200"
                  style={{ border: '1px solid var(--border-gray)', outline: 'none', fontSize: '16px' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--green-liturgical)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(45, 80, 22, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-gray)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="NIV">NIV</option>
                  <option value="ESV">ESV</option>
                  <option value="KJV">KJV</option>
                  <option value="NRSV">NRSV</option>
                  <option value="NLT">NLT</option>
                  <option value="NASB">NASB</option>
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--green-liturgical)' }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = 'var(--green-sage)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 80, 22, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--green-liturgical)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">Searching...</span>
                    </span>
                  ) : 'Search'}
                </button>
              </div>
            </div>

            {/* Translation Comparison Toggle */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableComparison}
                    onChange={(e) => {
                      setEnableComparison(e.target.checked);
                      if (e.target.checked && !compareVersion) {
                        setCompareVersion('ESV');
                      }
                    }}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Compare translations
                  </span>
                </label>

                {enableComparison && (
                  <div className="flex items-center gap-2 ml-7 sm:ml-0">
                    <span className="text-sm text-gray-600">with:</span>
                    <select
                      value={compareVersion}
                      onChange={(e) => setCompareVersion(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      style={{ fontSize: '16px' }}
                    >
                      <option value="NIV">NIV</option>
                      <option value="ESV">ESV</option>
                      <option value="KJV">KJV</option>
                      <option value="NRSV">NRSV</option>
                      <option value="NLT">NLT</option>
                      <option value="NASB">NASB</option>
                    </select>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                💡 Enter verse ranges like "Luke 18:1-8" to see multiple verses
              </p>
            </div>
          </form>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Found {results.length} verse{results.length !== 1 ? 's' : ''}
            </h2>
            {results.map((result, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-green-700">
                    {result.book} {result.chapter}:{result.verse}
                  </h3>
                  <button
                    onClick={() => handleSaveVerse(result)}
                    className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                  >
                    Save to Notes
                  </button>
                </div>

                {result.compareText ? (
                  /* Comparison Mode: Side-by-side Panels */
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-300">
                        <span className="text-sm font-bold text-green-800 uppercase">{result.version}</span>
                      </div>
                      <p className="text-gray-900 leading-relaxed">{result.text}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-300">
                        <span className="text-sm font-bold text-blue-800 uppercase">{result.compareVersion}</span>
                      </div>
                      <p className="text-gray-900 leading-relaxed">{result.compareText}</p>
                    </div>
                  </div>
                ) : (
                  /* Single Translation */
                  <div>
                    <span className="text-sm text-gray-500 font-medium mb-2 inline-block">{result.version}</span>
                    <p className="text-gray-800 leading-relaxed">{result.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p>Enter a keyword or Bible reference to search</p>
          </div>
        )}
      </div>
    </div>
  );
}
