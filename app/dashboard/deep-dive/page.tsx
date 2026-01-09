'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { BookOpen, Languages, History, Link2, Lightbulb, Loader2 } from 'lucide-react';

interface DeepDiveResult {
  passage: string;
  passageText: string;
  wordStudies: {
    word: string;
    original: string;
    language: string;
    definition: string;
    usage: string;
  }[];
  historicalContext: {
    setting: string;
    audience: string;
    culturalBackground: string;
  };
  literaryContext: {
    genre: string;
    structure: string;
    literaryDevices: string[];
  };
  crossReferences: {
    reference: string;
    connection: string;
  }[];
  theologicalThemes: {
    theme: string;
    explanation: string;
  }[];
  applicationInsights: string[];
}

export default function DeepDivePage() {
  const [passage, setPassage] = useState('');
  const [focusAreas, setFocusAreas] = useState<string[]>(['wordStudy', 'historical', 'crossRef']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeepDiveResult | null>(null);
  const [error, setError] = useState('');

  const focusOptions = [
    { id: 'wordStudy', label: 'Word Studies', icon: Languages },
    { id: 'historical', label: 'Historical Context', icon: History },
    { id: 'crossRef', label: 'Cross References', icon: Link2 },
    { id: 'theological', label: 'Theological Themes', icon: BookOpen },
    { id: 'application', label: 'Application Insights', icon: Lightbulb },
  ];

  const toggleFocus = (id: string) => {
    setFocusAreas((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passage.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/deep-dive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passage,
          focusAreas,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze passage');
      }

      const data = await response.json();
      setResult(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        showBackLink
        pageTitle="Deep Dive"
        pageIcon="🔬"
        colorScheme="blue"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Input Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Passage Analysis
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Enter a Bible passage for comprehensive study including word studies,
                historical context, and cross-references.
              </p>

              <form onSubmit={handleAnalyze} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bible Passage *
                  </label>
                  <input
                    type="text"
                    value={passage}
                    onChange={(e) => setPassage(e.target.value)}
                    required
                    placeholder="e.g., John 1:1-14 or Romans 8:28-30"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Focus Areas
                  </label>
                  <div className="space-y-2">
                    {focusOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = focusAreas.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleFocus(option.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 text-blue-700'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{option.label}</span>
                          {isSelected && (
                            <span className="ml-auto text-blue-600">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !passage.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Passage...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-5 h-5" />
                      Analyze Passage
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-3">
            {!result && !loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                  Your Analysis Will Appear Here
                </h3>
                <p className="text-gray-600">
                  Enter a Bible passage and select your focus areas to begin deep study.
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
                <p className="text-gray-600">Analyzing {passage}...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Passage Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6">
                  <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    {result.passage}
                  </h2>
                  {result.passageText && (
                    <p className="text-blue-100 italic">"{result.passageText}"</p>
                  )}
                </div>

                {/* Word Studies */}
                {result.wordStudies && result.wordStudies.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Languages className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                        Word Studies
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {result.wordStudies.map((word, idx) => (
                        <div key={idx} className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="font-bold text-blue-900">{word.word}</span>
                            <span className="text-sm text-blue-600">({word.original})</span>
                            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                              {word.language}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-1">
                            <strong>Definition:</strong> {word.definition}
                          </p>
                          <p className="text-gray-600 text-sm">
                            <strong>Usage:</strong> {word.usage}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Historical Context */}
                {result.historicalContext && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="w-5 h-5 text-amber-600" />
                      <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                        Historical Context
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Setting</h4>
                        <p className="text-gray-700">{result.historicalContext.setting}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Original Audience</h4>
                        <p className="text-gray-700">{result.historicalContext.audience}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Cultural Background</h4>
                        <p className="text-gray-700">{result.historicalContext.culturalBackground}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Literary Context */}
                {result.literaryContext && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                        Literary Context
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Genre</h4>
                        <p className="text-gray-700">{result.literaryContext.genre}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Structure</h4>
                        <p className="text-gray-700">{result.literaryContext.structure}</p>
                      </div>
                      {result.literaryContext.literaryDevices?.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Literary Devices</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.literaryContext.literaryDevices.map((device, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                              >
                                {device}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cross References */}
                {result.crossReferences && result.crossReferences.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Link2 className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                        Cross References
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {result.crossReferences.map((ref, idx) => (
                        <div key={idx} className="flex gap-4 p-3 bg-green-50 rounded-lg">
                          <span className="font-semibold text-green-700 whitespace-nowrap">
                            {ref.reference}
                          </span>
                          <span className="text-gray-700">{ref.connection}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Theological Themes */}
                {result.theologicalThemes && result.theologicalThemes.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                        Theological Themes
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {result.theologicalThemes.map((theme, idx) => (
                        <div key={idx}>
                          <h4 className="font-medium text-indigo-900 mb-1">{theme.theme}</h4>
                          <p className="text-gray-700">{theme.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application Insights */}
                {result.applicationInsights && result.applicationInsights.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                        Application Insights
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {result.applicationInsights.map((insight, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="text-amber-500 font-bold">{idx + 1}.</span>
                          <span className="text-gray-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
