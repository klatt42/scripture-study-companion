'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';

interface StudyGuide {
  title: string;
  passage: string;
  context: {
    historical: string;
    literary: string;
  };
  observation: {
    keyVerses: string[];
    importantWords: string[];
    mainThemes: string[];
  };
  interpretation: {
    meaning: string;
    crossReferences: string[];
  };
  application: {
    personalQuestions: string[];
    groupDiscussion: string[];
    actionSteps: string[];
  };
}

export default function StudyGuideGeneratorPage() {
  const [passage, setPassage] = useState('');
  const [studyType, setStudyType] = useState<'personal' | 'group'>('personal');
  const [guide, setGuide] = useState<StudyGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateGuide = async () => {
    if (!passage.trim()) {
      setError('Please enter a Bible passage to study');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 240000); // 4 minutes

      const response = await fetch('/api/study-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passage: passage.trim(),
          studyType,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate study guide');
      }

      const data = await response.json();
      setGuide(data.guide);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again with a shorter passage.');
      } else if (err.message === 'Failed to fetch') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGuide = async () => {
    if (!guide) return;

    try {
      const response = await fetch('/api/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: guide.title,
          passage: guide.passage,
          content: guide,
          study_type: studyType,
          status: 'saved',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save study guide');
      }

      alert('Study guide saved successfully!');
    } catch (err: any) {
      alert('Error saving guide: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-cream)' }}>
      <DashboardHeader
        showBackLink
        backLinkHref="/dashboard"
        backLinkText="← Dashboard"
        pageTitle="Study Guide Generator"
        pageIcon="📋"
        colorScheme="purple"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        {!guide && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Create a Study Guide
            </h2>
            <p className="text-gray-600 mb-6">
              Enter a Bible passage and we'll generate a comprehensive study guide using the inductive method (Observation, Interpretation, Application).
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="passage" className="block text-sm font-medium text-gray-700 mb-1">
                  Bible Passage
                </label>
                <input
                  id="passage"
                  type="text"
                  value={passage}
                  onChange={(e) => setPassage(e.target.value)}
                  placeholder="e.g., John 3:16-21, Psalm 23, Romans 8:28-39"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="studyType"
                      value="personal"
                      checked={studyType === 'personal'}
                      onChange={() => setStudyType('personal')}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700">Personal Study</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="studyType"
                      value="group"
                      checked={studyType === 'group'}
                      onChange={() => setStudyType('group')}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700">Group Study</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleGenerateGuide}
                disabled={loading || !passage.trim()}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating Study Guide... (1-2 minutes)' : 'Generate Study Guide'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Generated Guide */}
        {guide && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                    {guide.title}
                  </h1>
                  <p className="text-purple-600 font-medium mt-1">{guide.passage}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setGuide(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    New Guide
                  </button>
                  <button
                    onClick={handleSaveGuide}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Save Guide
                  </button>
                </div>
              </div>
            </div>

            {/* Context Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200" style={{ fontFamily: 'Georgia, serif' }}>
                📚 Context & Background
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Historical Context</h3>
                  <p className="text-gray-700 leading-relaxed">{guide.context.historical}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Literary Context</h3>
                  <p className="text-gray-700 leading-relaxed">{guide.context.literary}</p>
                </div>
              </div>
            </div>

            {/* Observation Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200" style={{ fontFamily: 'Georgia, serif' }}>
                🔍 Observation (What does it say?)
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Key Verses</h3>
                  <ul className="space-y-2">
                    {guide.observation.keyVerses.map((verse, i) => (
                      <li key={i} className="text-gray-700 pl-4 border-l-2 border-purple-300">
                        {verse}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Important Words & Phrases</h3>
                  <div className="flex flex-wrap gap-2">
                    {guide.observation.importantWords.map((word, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Main Themes</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {guide.observation.mainThemes.map((theme, i) => (
                      <li key={i} className="text-gray-700">{theme}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Interpretation Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200" style={{ fontFamily: 'Georgia, serif' }}>
                💡 Interpretation (What does it mean?)
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Meaning & Significance</h3>
                  <p className="text-gray-700 leading-relaxed">{guide.interpretation.meaning}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Cross References</h3>
                  <ul className="space-y-2">
                    {guide.interpretation.crossReferences.map((ref, i) => (
                      <li key={i} className="text-gray-700 pl-4 border-l-2 border-green-300">
                        {ref}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Application Section */}
            <div className="bg-blue-50 rounded-xl shadow-lg border border-blue-200 p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b border-blue-200" style={{ fontFamily: 'Georgia, serif' }}>
                ✨ Application (How should I respond?)
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Personal Reflection Questions</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    {guide.application.personalQuestions.map((q, i) => (
                      <li key={i} className="text-gray-700">{q}</li>
                    ))}
                  </ol>
                </div>
                {studyType === 'group' && (
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Group Discussion Questions</h3>
                    <ol className="list-decimal list-inside space-y-2">
                      {guide.application.groupDiscussion.map((q, i) => (
                        <li key={i} className="text-gray-700">{q}</li>
                      ))}
                    </ol>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Action Steps</h3>
                  <ul className="space-y-2">
                    {guide.application.actionSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-600 font-bold">→</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 py-4">
              <p>This study guide is a starting point. Allow the Holy Spirit to guide your deeper study and reflection.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
