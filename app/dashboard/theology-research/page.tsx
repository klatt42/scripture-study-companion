'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';

interface ResearchResult {
  topic: string;
  summary: string;
  keyScriptures: string[];
  theologicalPerspectives: string[];
  practicalApplications: string[];
  furtherReading: string[];
}

export default function TheologyResearchPage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState('');

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/theology-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('Research failed');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!result) return;

    try {
      // Format research as readable note content
      const noteContent = `
# ${result.topic}

## Summary
${result.summary}

## Key Scriptures
${result.keyScriptures.map(s => `- ${s}`).join('\n')}

## Theological Perspectives
${result.theologicalPerspectives.map(p => `- ${p}`).join('\n')}

## Practical Applications
${result.practicalApplications.map(a => `- ${a}`).join('\n')}

## Further Reading
${result.furtherReading.map(r => `- ${r}`).join('\n')}
`;

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Theology Research: ${result.topic}`,
          content: noteContent,
          category: 'study', // This will be converted to tags array
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      alert('Research saved to your notes!');
    } catch (err) {
      alert('Failed to save note');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-cream)' }}>
      {/* Shared Header with green color scheme */}
      <DashboardHeader
        showBackLink
        pageTitle="Theology Research"
        pageIcon="🕊️"
        colorScheme="green"
      />

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleResearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                placeholder="e.g., Trinity, Justification by Faith, Eschatology"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50"
            >
              {loading ? 'Researching...' : 'Research Topic'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{result.topic}</h2>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
              >
                Save to Notes
              </button>
            </div>

            {/* Summary */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                Summary
              </h3>
              <p className="text-gray-700 leading-relaxed">{result.summary}</p>
            </div>

            {/* Key Scriptures */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                Key Scriptures
              </h3>
              <ul className="space-y-2">
                {result.keyScriptures.map((scripture, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start">
                    <span className="text-orange-500 mr-2">📖</span>
                    {scripture}
                  </li>
                ))}
              </ul>
            </div>

            {/* Theological Perspectives */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                Theological Perspectives
              </h3>
              <ul className="space-y-2">
                {result.theologicalPerspectives.map((perspective, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    {perspective}
                  </li>
                ))}
              </ul>
            </div>

            {/* Practical Applications */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                Practical Applications
              </h3>
              <ul className="space-y-2">
                {result.practicalApplications.map((application, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    {application}
                  </li>
                ))}
              </ul>
            </div>

            {/* Further Reading */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                Further Reading
              </h3>
              <ul className="space-y-2">
                {result.furtherReading.map((resource, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start">
                    <span className="text-orange-500 mr-2">📚</span>
                    {resource}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!loading && !result && !error && (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>Enter a theological topic to research</p>
          </div>
        )}
      </div>
    </div>
  );
}
