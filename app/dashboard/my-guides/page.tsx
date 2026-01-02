'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader';

interface SavedSermon {
  id: string;
  title: string;
  theme: string;
  scripture_reference: string;
  created_at: string;
  status: string;
  content: any;
}

export default function SermonOutlinesPage() {
  const [sermons, setSermons] = useState<SavedSermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSermon, setSelectedSermon] = useState<SavedSermon | null>(null);

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const response = await fetch('/api/sermons');
      if (!response.ok) {
        throw new Error('Failed to fetch sermons');
      }
      const data = await response.json();
      setSermons(data.sermons || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-cream)' }}>
      {/* Shared Header with purple color scheme */}
      <DashboardHeader
        showBackLink
        pageTitle="My Sermon Outlines"
        pageIcon="📜"
        colorScheme="purple"
        rightContent={
          <Link
            href="/dashboard/sermon-ideas"
            className="text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
            }}
          >
            + New Sermon
          </Link>
        }
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading sermons...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && sermons.length === 0 && (
          <div className="text-center py-12">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sermon outlines yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first sermon idea
            </p>
            <Link
              href="/dashboard/sermon-ideas"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Create Your First Sermon
            </Link>
          </div>
        )}

        {!loading && !error && sermons.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sermon List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Saved Outlines ({sermons.length})
                </h2>
                <div className="space-y-2">
                  {sermons.map((sermon) => (
                    <button
                      key={sermon.id}
                      onClick={() => setSelectedSermon(sermon)}
                      className={`w-full text-left p-4 rounded-lg transition ${
                        selectedSermon?.id === sermon.id
                          ? 'bg-purple-50 border-2 border-purple-500'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                        {sermon.title}
                      </h3>
                      <p className="text-xs text-purple-600 mb-2">
                        {sermon.scripture_reference}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(sermon.created_at)}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                        sermon.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {sermon.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sermon Detail */}
            <div className="lg:col-span-2">
              {selectedSermon ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedSermon.title}
                    </h2>
                  </div>

                  {selectedSermon.scripture_reference && (
                    <p className="text-purple-600 italic mb-6">
                      Scripture: {selectedSermon.scripture_reference}
                    </p>
                  )}

                  <div className="prose max-w-none space-y-6">
                    {selectedSermon.content?.introduction && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                          Introduction
                        </h3>
                        <div className="text-gray-700 whitespace-pre-wrap">
                          {selectedSermon.content.introduction}
                        </div>
                      </div>
                    )}

                    {selectedSermon.content?.points?.map((point: any, idx: number) => (
                      <div key={idx}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                          Point {idx + 1}: {point.title}
                        </h3>
                        <div className="text-gray-700 whitespace-pre-wrap">
                          {point.content}
                        </div>
                      </div>
                    ))}

                    {selectedSermon.content?.conclusion && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                          Conclusion
                        </h3>
                        <div className="text-gray-700 whitespace-pre-wrap">
                          {selectedSermon.content.conclusion}
                        </div>
                      </div>
                    )}

                    {selectedSermon.content?.applicationQuestions && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">
                          Application Questions
                        </h3>
                        <ul className="space-y-2">
                          {selectedSermon.content.applicationQuestions.map((q: string, i: number) => (
                            <li key={i} className="text-gray-700 flex items-start">
                              <span className="text-blue-600 font-bold mr-3">{i + 1}.</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t text-sm text-gray-500">
                    <p>Created: {formatDate(selectedSermon.created_at)}</p>
                    <p className="mt-1">Status: {selectedSermon.status}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-500">
                    Select a sermon outline from the list to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
