'use client';

import { useState } from 'react';
import { Loader2, Plus, X, Search, Save, ArrowLeft, CheckCircle } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';

interface StudyTopic {
  title: string;
  theme: string;
  scripture: string;
  description: string;
  keyQuestions: string[];
}

interface StudyGuide {
  title: string;
  passage: string;
  context: string;
  observation: string;
  interpretation: string;
  application: string;
  discussion_questions: string[];
  prayer_points: string[];
}

export default function StudyTopicsPage() {
  const [generalTheme, setGeneralTheme] = useState('');
  const [scriptures, setScriptures] = useState<string[]>([]);
  const [currentScripture, setCurrentScripture] = useState('');
  const [studyType, setStudyType] = useState('individual');
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [error, setError] = useState('');

  // Study guide generation state
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic | null>(null);
  const [generatingGuide, setGeneratingGuide] = useState(false);
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAddScripture = () => {
    if (currentScripture.trim() && scriptures.length < 5) {
      setScriptures([...scriptures, currentScripture.trim()]);
      setCurrentScripture('');
    }
  };

  const handleRemoveScripture = (index: number) => {
    setScriptures(scriptures.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddScripture();
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTopics([]);
    setSelectedTopic(null);
    setStudyGuide(null);
    setSaved(false);

    const allScriptures = [...scriptures];
    if (currentScripture.trim() && !scriptures.includes(currentScripture.trim())) {
      allScriptures.push(currentScripture.trim());
      setScriptures(allScriptures);
      setCurrentScripture('');
    }

    try {
      const response = await fetch('/api/study-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          general_theme: generalTheme,
          scriptures: allScriptures,
          study_type: studyType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate study topics');
      }

      const data = await response.json();
      setTopics(data.topics);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = async (topic: StudyTopic) => {
    setSelectedTopic(topic);
    setGeneratingGuide(true);
    setStudyGuide(null);
    setError('');
    setSaved(false);

    try {
      const response = await fetch('/api/study-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passage: topic.scripture,
          version: 'NIV',
          study_type: studyType,
          focus_theme: topic.theme,
          key_questions: topic.keyQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate study guide');
      }

      const data = await response.json();
      setStudyGuide({
        title: topic.title,
        passage: topic.scripture,
        ...data.guide,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate study guide';
      setError(errorMessage);
      setSelectedTopic(null);
    } finally {
      setGeneratingGuide(false);
    }
  };

  const handleSaveGuide = async () => {
    if (!studyGuide) return;

    setSaving(true);
    try {
      const response = await fetch('/api/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: studyGuide.title,
          passage: studyGuide.passage,
          context: studyGuide.context,
          observation: studyGuide.observation,
          interpretation: studyGuide.interpretation,
          application: studyGuide.application,
          discussion_questions: studyGuide.discussion_questions,
          prayer_points: studyGuide.prayer_points,
          tags: [selectedTopic?.theme || 'study'],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save study guide');
      }

      setSaved(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setStudyGuide(null);
    setSaved(false);
    setError('');
  };

  const handleStartOver = () => {
    setTopics([]);
    setSelectedTopic(null);
    setStudyGuide(null);
    setSaved(false);
    setError('');
    setGeneralTheme('');
    setScriptures([]);
  };

  // Show study guide view
  if (studyGuide) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          showBackLink
          pageTitle="Study Guide"
          pageIcon="📖"
          colorScheme="green"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Action buttons */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBackToTopics}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{ color: 'var(--purple-deep)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Topics
            </button>

            <div className="flex gap-3">
              {saved ? (
                <span className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-green-100 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  Saved to My Guides
                </span>
              ) : (
                <button
                  onClick={handleSaveGuide}
                  disabled={saving}
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--green-liturgical)' }}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save to My Guides'}
                </button>
              )}
              <button
                onClick={handleStartOver}
                className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--purple-very-light)',
                  color: 'var(--purple-deep)'
                }}
              >
                New Study
              </button>
            </div>
          </div>

          {/* Study Guide Content */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 text-white" style={{ backgroundColor: 'var(--green-liturgical)' }}>
              <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                {studyGuide.title}
              </h1>
              <p className="text-white/90">{studyGuide.passage}</p>
            </div>

            {/* Content sections */}
            <div className="p-6 space-y-6">
              {/* Context */}
              <section>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--purple-deep)', fontFamily: 'Georgia, serif' }}>
                  <span className="text-xl">📜</span> Context
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{studyGuide.context}</p>
              </section>

              {/* Observation */}
              <section>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--purple-deep)', fontFamily: 'Georgia, serif' }}>
                  <span className="text-xl">👁️</span> Observation
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{studyGuide.observation}</p>
              </section>

              {/* Interpretation */}
              <section>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--purple-deep)', fontFamily: 'Georgia, serif' }}>
                  <span className="text-xl">💡</span> Interpretation
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{studyGuide.interpretation}</p>
              </section>

              {/* Application */}
              <section>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--purple-deep)', fontFamily: 'Georgia, serif' }}>
                  <span className="text-xl">🎯</span> Application
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{studyGuide.application}</p>
              </section>

              {/* Discussion Questions */}
              {studyGuide.discussion_questions && studyGuide.discussion_questions.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--purple-deep)', fontFamily: 'Georgia, serif' }}>
                    <span className="text-xl">💬</span> Discussion Questions
                  </h2>
                  <ol className="list-decimal list-inside space-y-2">
                    {studyGuide.discussion_questions.map((q, i) => (
                      <li key={i} className="text-gray-700">{q}</li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Prayer Points */}
              {studyGuide.prayer_points && studyGuide.prayer_points.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--purple-deep)', fontFamily: 'Georgia, serif' }}>
                    <span className="text-xl">🙏</span> Prayer Points
                  </h2>
                  <ul className="space-y-2">
                    {studyGuide.prayer_points.map((p, i) => (
                      <li key={i} className="text-gray-700 flex items-start gap-2">
                        <span style={{ color: 'var(--purple-medium)' }}>•</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while generating guide
  if (generatingGuide) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          showBackLink
          pageTitle="Study Topic Explorer"
          pageIcon="🔍"
          colorScheme="purple"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6" style={{ color: 'var(--purple-deep)' }} />
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif', color: 'var(--purple-deep)' }}>
              Creating Your Study Guide
            </h2>
            <p className="text-gray-600 mb-2">
              Generating a comprehensive study guide for:
            </p>
            <p className="text-lg font-semibold" style={{ color: 'var(--purple-medium)' }}>
              {selectedTopic?.title}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              This may take a moment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        showBackLink
        pageTitle="Study Topic Explorer"
        pageIcon="🔍"
        colorScheme="purple"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif', color: 'var(--purple-deep)' }}>
            What Would You Like to Study?
          </h2>
          <p style={{ color: 'var(--text-medium)' }}>
            Provide a topic or theme, get 3 study topic suggestions, then select one to generate a complete study guide.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Input Form */}
          <div>
            <div className="bg-white rounded-xl shadow-md border-l-4 p-8" style={{ borderColor: 'var(--purple-deep)' }}>
              <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                Your Study Interests
              </h2>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>
                    Topic or Theme *
                  </label>
                  <input
                    type="text"
                    value={generalTheme}
                    onChange={(e) => setGeneralTheme(e.target.value)}
                    required
                    placeholder="e.g., Prayer, Grace, Faith during trials, The Holy Spirit"
                    className="w-full px-4 py-3 rounded-lg transition-all duration-200"
                    style={{
                      border: '1px solid var(--border-gray)',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--purple-deep)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(91, 44, 111, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-gray)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>
                    Scripture References (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentScripture}
                      onChange={(e) => setCurrentScripture(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="e.g., Romans 8, John 15:1-17"
                      className="flex-1 px-4 py-3 rounded-lg transition-all duration-200"
                      style={{
                        border: '1px solid var(--border-gray)',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--purple-deep)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(91, 44, 111, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-gray)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddScripture}
                      disabled={!currentScripture.trim() || scriptures.length >= 5}
                      className="px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                      style={{
                        backgroundColor: 'var(--purple-very-light)',
                        color: 'var(--purple-deep)',
                        border: '1px solid var(--purple-light)'
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-light)' }}>
                    Add up to 5 scripture references to focus your study
                  </p>

                  {scriptures.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {scriptures.map((scripture, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: 'var(--purple-very-light)',
                            color: 'var(--purple-deep)',
                            border: '1px solid var(--purple-light)'
                          }}
                        >
                          {scripture}
                          <button
                            type="button"
                            onClick={() => handleRemoveScripture(index)}
                            className="ml-1 hover:opacity-70 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>
                    Study Type
                  </label>
                  <select
                    value={studyType}
                    onChange={(e) => setStudyType(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg transition-all duration-200"
                    style={{
                      border: '1px solid var(--border-gray)',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--purple-deep)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(91, 44, 111, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-gray)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="individual">Individual Study</option>
                    <option value="small-group">Small Group</option>
                    <option value="family">Family Devotions</option>
                    <option value="academic">Academic/In-Depth</option>
                  </select>
                </div>

                {error && (
                  <div className="p-4 rounded-lg text-sm" style={{
                    backgroundColor: '#FEE',
                    border: '1px solid #FCC',
                    color: '#C33'
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--purple-deep)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = 'var(--purple-medium)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(91, 44, 111, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--purple-deep)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5" />
                      Exploring Topics...
                    </span>
                  ) : (
                    'Discover 3 Study Topics'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Generated Topics */}
          <div>
            {!topics.length && !loading && (
              <div className="bg-white rounded-xl shadow-md p-8 min-h-[500px] flex items-center justify-center" style={{ border: '1px dashed var(--purple-light)' }}>
                <div className="text-center">
                  <Search className="mx-auto h-16 w-16 mb-4" style={{ color: 'var(--purple-light)' }} />
                  <p className="text-lg font-medium mb-2" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                    Your Study Topics Will Appear Here
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-medium)' }}>
                    Enter a topic and click Discover to begin exploring
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-xl shadow-md p-8 min-h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-16 w-16 mb-4 animate-spin" style={{ color: 'var(--purple-deep)' }} />
                  <p className="text-lg font-medium" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                    Discovering Study Topics...
                  </p>
                </div>
              </div>
            )}

            {topics.length > 0 && !loading && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Georgia, serif', color: 'var(--purple-deep)' }}>
                  Select a Topic to Create Study Guide
                </h2>
                {topics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl shadow-md border-l-4 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    style={{ borderColor: 'var(--purple-deep)' }}
                    onClick={() => handleSelectTopic(topic)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                          {idx + 1}. {topic.title}
                        </h3>
                        <p className="text-sm font-medium" style={{ color: 'var(--purple-deep)' }}>
                          {topic.scripture}
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 flex-shrink-0 ml-2 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: 'var(--text-light)' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-medium)' }}>
                      {topic.description}
                    </p>
                    <div className="pt-3 mt-3" style={{ borderTop: '1px solid var(--border-gray)' }}>
                      <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-light)' }}>
                        Key Questions to Explore:
                      </p>
                      <ul className="space-y-1">
                        {topic.keyQuestions.map((question, i) => (
                          <li key={i} className="text-sm flex items-start" style={{ color: 'var(--text-medium)' }}>
                            <span style={{ color: 'var(--purple-medium)' }} className="mr-2">•</span>
                            {question}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4 text-right">
                      <span className="text-sm font-medium group-hover:underline" style={{ color: 'var(--purple-deep)' }}>
                        Click to Generate Study Guide →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
