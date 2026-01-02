'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';

interface SermonIdea {
  title: string;
  theme: string;
  scripture: string;
  description: string;
  keyPoints: string[];
}

interface SermonOutline {
  title: string;
  scripture: string;
  introduction: string;
  points: Array<{
    title: string;
    content: string;
  }>;
  conclusion: string;
  applicationQuestions: string[];
}

export default function SermonOutlineGeneratorPage() {
  const [selectedIdea, setSelectedIdea] = useState<SermonIdea | null>(null);
  const [outline, setOutline] = useState<SermonOutline | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Get selected idea from sessionStorage
    const storedIdea = sessionStorage.getItem('selectedSermonIdea');
    if (storedIdea) {
      setSelectedIdea(JSON.parse(storedIdea));
    } else {
      // Redirect back if no idea selected
      router.push('/dashboard/sermon-ideas');
    }
  }, [router]);

  const handleGenerateOutline = async () => {
    if (!selectedIdea) return;

    setLoading(true);
    setError('');

    try {
      // Create an AbortController with a 4-minute timeout (AI generation can be slow)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 240000); // 4 minutes

      const response = await fetch('/api/sermon-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedIdea.title,
          theme: selectedIdea.theme,
          scripture: selectedIdea.scripture,
          description: selectedIdea.description,
          key_points: selectedIdea.keyPoints,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to generate sermon outline');
      }

      const data = await response.json();
      setOutline(data.outline);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. AI generation took too long. Please try again with a simpler sermon idea.');
      } else if (err.message === 'Failed to fetch') {
        setError('Network error. Please check your connection and try again. Note: AI generation can take 1-2 minutes.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOutline = async () => {
    if (!outline || !selectedIdea) return;

    try {
      const response = await fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: outline.title,
          theme: selectedIdea.theme,
          scripture_reference: outline.scripture,
          content: outline,
          status: 'draft',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save outline');
      }

      alert('Sermon outline saved successfully!');
      router.push('/dashboard/sermon-outlines');
    } catch (err: any) {
      alert('Error saving outline: ' + err.message);
    }
  };

  if (!selectedIdea) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-cream)' }}>
      {/* Shared Header with purple color scheme */}
      <DashboardHeader
        showBackLink
        backLinkHref="/dashboard/sermon-ideas"
        backLinkText="← Back to Ideas"
        pageTitle="Sermon Outline Generator"
        pageIcon="📜"
        colorScheme="purple"
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selected Idea Summary */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-purple-900 mb-2">
            Selected Sermon Idea
          </h2>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {selectedIdea.title}
          </h3>
          <p className="text-sm text-purple-700 font-medium mb-3">
            {selectedIdea.scripture}
          </p>
          <p className="text-gray-700 mb-4">{selectedIdea.description}</p>
          {!outline && (
            <button
              onClick={handleGenerateOutline}
              disabled={loading}
              className="bg-purple-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Generating Outline... (This may take 1-2 minutes)' : 'Generate Detailed Outline'}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Generated Outline */}
        {outline && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {outline.title}
              </h2>
              <button
                onClick={handleSaveOutline}
                className="px-6 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
              >
                Save Outline
              </button>
            </div>

            {outline.scripture && (
              <p className="text-purple-600 italic mb-8 text-lg">
                Scripture: {outline.scripture}
              </p>
            )}

            <div className="prose max-w-none space-y-8">
              {/* Introduction */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Introduction
                </h3>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {outline.introduction}
                </div>
              </div>

              {/* Main Points */}
              {outline.points?.map((point, idx) => (
                <div key={idx}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                    Point {idx + 1}: {point.title}
                  </h3>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {point.content}
                  </div>
                </div>
              ))}

              {/* Conclusion */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Conclusion
                </h3>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {outline.conclusion}
                </div>
              </div>

              {/* Application Questions */}
              {outline.applicationQuestions && outline.applicationQuestions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    Application Questions for Reflection
                  </h3>
                  <ul className="space-y-2">
                    {outline.applicationQuestions.map((question, i) => (
                      <li key={i} className="text-gray-700 flex items-start">
                        <span className="text-blue-600 font-bold mr-3">{i + 1}.</span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>This outline is a starting point. Use it as a foundation for your sermon preparation and personal research.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
