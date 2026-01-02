'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SermonWriterPage() {
  const [theme, setTheme] = useState('');
  const [scripture, setScripture] = useState('');
  const [targetLength, setTargetLength] = useState('30min');
  const [audienceType, setAudienceType] = useState('general');
  const [loading, setLoading] = useState(false);
  const [sermon, setSermon] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSermon(null);

    try {
      const response = await fetch('/api/sermon-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          scripture_reference: scripture,
          target_length: targetLength,
          audience_type: audienceType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate sermon');
      }

      const data = await response.json();
      setSermon(data.sermon);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!sermon) return;

    try {
      const response = await fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sermon.title,
          theme,
          scripture_reference: scripture,
          content: sermon,
          target_length: targetLength,
          audience_type: audienceType,
          status: 'draft',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save sermon');
      }

      alert('Sermon saved successfully!');
    } catch (err: any) {
      alert('Error saving sermon: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Sermon Writer
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Input Form */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Sermon Details
              </h2>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme / Topic *
                  </label>
                  <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    required
                    placeholder="e.g., Faith in difficult times"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scripture Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={scripture}
                    onChange={(e) => setScripture(e.target.value)}
                    placeholder="e.g., John 3:16 or Romans 8:28-30"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Length
                  </label>
                  <select
                    value={targetLength}
                    onChange={(e) => setTargetLength(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="15min">15 minutes</option>
                    <option value="30min">30 minutes</option>
                    <option value="45min">45 minutes</option>
                    <option value="60min">60 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience Type
                  </label>
                  <select
                    value={audienceType}
                    onChange={(e) => setAudienceType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General Congregation</option>
                    <option value="youth">Youth</option>
                    <option value="seniors">Seniors</option>
                    <option value="children">Children</option>
                  </select>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Generating Sermon...
                    </span>
                  ) : (
                    'Generate Sermon with AI'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Output */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[600px]">
              {!sermon && !loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <p className="text-lg font-medium">
                      Your sermon will appear here
                    </p>
                    <p className="text-sm mt-2">
                      Fill in the details and click "Generate" to start
                    </p>
                  </div>
                </div>
              )}

              {sermon && (
                <div className="prose max-w-none">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 m-0">
                      {sermon.title}
                    </h2>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                    >
                      Save Sermon
                    </button>
                  </div>

                  {sermon.scripture && (
                    <p className="text-gray-600 italic mb-6">
                      Scripture: {sermon.scripture}
                    </p>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Introduction
                      </h3>
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {sermon.introduction}
                      </div>
                    </div>

                    {sermon.points?.map((point: any, idx: number) => (
                      <div key={idx}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Point {idx + 1}: {point.title}
                        </h3>
                        <div className="text-gray-700 space-y-2 whitespace-pre-wrap">
                          {point.content}
                        </div>
                      </div>
                    ))}

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Conclusion
                      </h3>
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {sermon.conclusion}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
