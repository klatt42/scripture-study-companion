'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader';
import { BookOpen, Search, Filter, Trash2, Edit, Eye, Plus, Calendar, Tag } from 'lucide-react';

interface StudyGuide {
  id: string;
  title: string;
  passage: string;
  study_type: string;
  created_at: string;
  content: {
    context?: {
      historical?: string;
      literary?: string;
    };
    observation?: {
      keyVerses?: string[];
      importantWords?: string[];
      mainThemes?: string[];
    };
    interpretation?: {
      meaning?: string;
      crossReferences?: string[];
    };
    application?: {
      personalQuestions?: string[];
      groupDiscussion?: string[];
      actionSteps?: string[];
    };
  };
}

// Sample data for demo
const SAMPLE_GUIDES: StudyGuide[] = [
  {
    id: '1',
    title: 'Study Guide: John 3:16-21',
    passage: 'John 3:16-21',
    study_type: 'personal',
    created_at: '2025-12-28T10:30:00Z',
    content: {
      context: {
        historical: 'Jesus speaking with Nicodemus, a Pharisee...',
        literary: 'Part of John\'s Gospel, focusing on belief and eternal life...',
      },
      observation: {
        keyVerses: ['For God so loved the world...', 'Whoever believes in him...'],
        importantWords: ['loved', 'believes', 'eternal life', 'condemned'],
        mainThemes: ['God\'s love', 'Faith', 'Salvation'],
      },
    },
  },
  {
    id: '2',
    title: 'Study Guide: Romans 8:28-39',
    passage: 'Romans 8:28-39',
    study_type: 'group',
    created_at: '2025-12-25T14:00:00Z',
    content: {
      context: {
        historical: 'Paul writing to the church in Rome...',
      },
      observation: {
        keyVerses: ['And we know that in all things God works for good...'],
        mainThemes: ['God\'s sovereignty', 'Security in Christ', 'Predestination'],
      },
    },
  },
  {
    id: '3',
    title: 'Study Guide: Psalm 23',
    passage: 'Psalm 23',
    study_type: 'personal',
    created_at: '2025-12-20T09:15:00Z',
    content: {
      observation: {
        keyVerses: ['The Lord is my shepherd...'],
        importantWords: ['shepherd', 'green pastures', 'still waters'],
        mainThemes: ['God as Provider', 'Trust', 'Peace'],
      },
    },
  },
];

export default function MyGuidesPage() {
  const [guides, setGuides] = useState<StudyGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<StudyGuide | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'group'>('all');

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      // In production, fetch from API
      // const response = await fetch('/api/guides');
      // const data = await response.json();
      // setGuides(data.guides);

      // Demo data
      await new Promise((resolve) => setTimeout(resolve, 500));
      setGuides(SAMPLE_GUIDES);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this study guide?')) return;

    try {
      // In production, call API
      // await fetch(`/api/guides?id=${id}`, { method: 'DELETE' });
      setGuides((prev) => prev.filter((g) => g.id !== id));
      if (selectedGuide?.id === id) setSelectedGuide(null);
    } catch (err: any) {
      alert('Failed to delete guide: ' + err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredGuides = guides.filter((guide) => {
    const matchesSearch =
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.passage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || guide.study_type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        showBackLink
        pageTitle="My Study Guides"
        pageIcon="📖"
        colorScheme="purple"
        rightContent={
          <Link
            href="/dashboard/study-guide"
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-white/20 hover:bg-white/30"
          >
            <Plus className="w-4 h-4" />
            New Guide
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or passage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'personal' | 'group')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="personal">Personal Study</option>
              <option value="group">Group Study</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading your study guides...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && filteredGuides.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              {searchQuery || filterType !== 'all' ? 'No matching guides found' : 'No study guides yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Create your first study guide to get started'}
            </p>
            <Link
              href="/dashboard/study-guide"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Study Guide
            </Link>
          </div>
        )}

        {!loading && !error && filteredGuides.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Guide List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                    Saved Guides ({filteredGuides.length})
                  </h2>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredGuides.map((guide) => (
                    <button
                      key={guide.id}
                      onClick={() => setSelectedGuide(guide)}
                      className={`w-full text-left p-4 border-b border-gray-100 transition ${
                        selectedGuide?.id === guide.id
                          ? 'bg-purple-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {guide.passage}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                guide.study_type === 'group'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {guide.study_type === 'group' ? 'Group' : 'Personal'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(guide.created_at)}
                            </span>
                          </div>
                          {guide.content.observation?.mainThemes && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {guide.content.observation.mainThemes.slice(0, 2).map((theme, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded"
                                >
                                  {theme}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Guide Detail */}
            <div className="lg:col-span-2">
              {selectedGuide ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                          {selectedGuide.passage}
                        </h2>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(selectedGuide.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {selectedGuide.study_type === 'group' ? 'Group Study' : 'Personal Study'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(selectedGuide.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                    {/* Context */}
                    {selectedGuide.content.context && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-purple-900" style={{ fontFamily: 'Georgia, serif' }}>
                          Context
                        </h3>
                        {selectedGuide.content.context.historical && (
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-700 mb-1">Historical</h4>
                            <p className="text-gray-600">{selectedGuide.content.context.historical}</p>
                          </div>
                        )}
                        {selectedGuide.content.context.literary && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-1">Literary</h4>
                            <p className="text-gray-600">{selectedGuide.content.context.literary}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Observation */}
                    {selectedGuide.content.observation && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-purple-900" style={{ fontFamily: 'Georgia, serif' }}>
                          Observation
                        </h3>
                        {selectedGuide.content.observation.keyVerses && (
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-700 mb-2">Key Verses</h4>
                            <ul className="space-y-2">
                              {selectedGuide.content.observation.keyVerses.map((verse, i) => (
                                <li key={i} className="p-3 bg-purple-50 rounded-lg text-gray-700 italic">
                                  "{verse}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedGuide.content.observation.importantWords && (
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-700 mb-2">Important Words</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedGuide.content.observation.importantWords.map((word, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                                  {word}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedGuide.content.observation.mainThemes && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Main Themes</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedGuide.content.observation.mainThemes.map((theme, i) => (
                                <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                                  {theme}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interpretation */}
                    {selectedGuide.content.interpretation && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-purple-900" style={{ fontFamily: 'Georgia, serif' }}>
                          Interpretation
                        </h3>
                        {selectedGuide.content.interpretation.meaning && (
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-700 mb-1">Meaning</h4>
                            <p className="text-gray-600 whitespace-pre-wrap">
                              {selectedGuide.content.interpretation.meaning}
                            </p>
                          </div>
                        )}
                        {selectedGuide.content.interpretation.crossReferences && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Cross References</h4>
                            <ul className="space-y-1">
                              {selectedGuide.content.interpretation.crossReferences.map((ref, i) => (
                                <li key={i} className="text-gray-600 flex items-start gap-2">
                                  <span className="text-purple-500">•</span>
                                  {ref}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Application */}
                    {selectedGuide.content.application && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-purple-900" style={{ fontFamily: 'Georgia, serif' }}>
                          Application
                        </h3>
                        {selectedGuide.content.application.personalQuestions && (
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-700 mb-2">Personal Questions</h4>
                            <ul className="space-y-2">
                              {selectedGuide.content.application.personalQuestions.map((q, i) => (
                                <li key={i} className="text-gray-600 flex items-start gap-2">
                                  <span className="text-purple-600 font-bold">{i + 1}.</span>
                                  {q}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedGuide.content.application.actionSteps && (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-800 mb-2">Action Steps</h4>
                            <ul className="space-y-1">
                              {selectedGuide.content.application.actionSteps.map((step, i) => (
                                <li key={i} className="text-green-700 flex items-start gap-2">
                                  <span>✓</span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center h-full flex items-center justify-center">
                  <div>
                    <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">
                      Select a study guide from the list to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
