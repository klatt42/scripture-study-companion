'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lightbulb, Loader2, Plus, X, Search } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';

interface StudyTopic {
  title: string;
  theme: string;
  scripture: string;
  description: string;
  keyQuestions: string[];
}

export default function StudyTopicsPage() {
  const [generalTheme, setGeneralTheme] = useState('');
  const [scriptures, setScriptures] = useState<string[]>([]);
  const [currentScripture, setCurrentScripture] = useState('');
  const [studyType, setStudyType] = useState('individual');
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();

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

    // Auto-include any scripture left in the input field
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
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = (topic: StudyTopic) => {
    // Store selected topic in sessionStorage and navigate to study guide generator
    sessionStorage.setItem('selectedStudyTopic', JSON.stringify(topic));
    router.push('/dashboard/study-guide');
  };

  return (
    <div className="min-h-screen">
      {/* Shared Header with purple color scheme */}
      <DashboardHeader
        showBackLink
        pageTitle="Study Topic Explorer"
        pageIcon="🔍"
        colorScheme="purple"
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif', color: 'var(--purple-deep)' }}>
            What Would You Like to Study?
          </h2>
          <p style={{ color: 'var(--text-medium)' }}>
            Provide a topic or theme you're interested in exploring, and AI will suggest 3 focused study topics with key questions.
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
                    Add up to 5 scripture references to focus your study (press Enter or click Add)
                  </p>

                  {/* Scripture Tags */}
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
                    Enter a topic and click "Discover" to begin exploring
                  </p>
                </div>
              </div>
            )}

            {topics.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Georgia, serif', color: 'var(--purple-deep)' }}>
                  Choose a Study Topic
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
                      <button className="text-sm font-medium group-hover:underline" style={{ color: 'var(--purple-deep)' }}>
                        Create Study Guide from This Topic →
                      </button>
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
