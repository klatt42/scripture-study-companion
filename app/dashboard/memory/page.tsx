'use client';

import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { Brain, Plus, Play, CheckCircle, Clock, Trophy, ChevronRight } from 'lucide-react';

interface MemoryVerse {
  id: string;
  reference: string;
  text: string;
  translation: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
  next_review?: string;
  ease_factor?: number;
  repetitions?: number;
}

const SAMPLE_VERSES: MemoryVerse[] = [
  {
    id: '1',
    reference: 'John 3:16',
    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    translation: 'NIV',
    status: 'learning',
    next_review: 'Today',
    repetitions: 3,
  },
  {
    id: '2',
    reference: 'Philippians 4:13',
    text: 'I can do all things through Christ who strengthens me.',
    translation: 'NKJV',
    status: 'review',
    next_review: 'Tomorrow',
    repetitions: 7,
  },
  {
    id: '3',
    reference: 'Psalm 23:1',
    text: 'The LORD is my shepherd; I shall not want.',
    translation: 'KJV',
    status: 'mastered',
    next_review: 'In 7 days',
    repetitions: 15,
  },
];

const statusColors = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New' },
  learning: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Learning' },
  review: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Review' },
  mastered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Mastered' },
};

export default function MemoryPage() {
  const [verses, setVerses] = useState<MemoryVerse[]>(SAMPLE_VERSES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dueToday, setDueToday] = useState(2);

  // Calculate stats
  const stats = {
    total: verses.length,
    mastered: verses.filter((v) => v.status === 'mastered').length,
    learning: verses.filter((v) => v.status === 'learning').length,
    dueToday: dueToday,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        showBackLink
        pageTitle="Verse Memory"
        pageIcon="🧠"
        colorScheme="gold"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-amber-500">
            <div className="text-2xl font-bold text-amber-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Verses</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-green-500">
            <div className="text-2xl font-bold text-green-600">{stats.mastered}</div>
            <div className="text-sm text-gray-600">Mastered</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-purple-500">
            <div className="text-2xl font-bold text-purple-600">{stats.learning}</div>
            <div className="text-sm text-gray-600">Learning</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-red-500">
            <div className="text-2xl font-bold text-red-600">{stats.dueToday}</div>
            <div className="text-sm text-gray-600">Due Today</div>
          </div>
        </div>

        {/* Practice Button */}
        {stats.dueToday > 0 && (
          <div className="mb-8">
            <a
              href="/dashboard/memory/practice"
              className="flex items-center justify-between w-full p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-bold">Start Practice Session</div>
                  <div className="text-amber-100">{stats.dueToday} verses due for review</div>
                </div>
              </div>
              <ChevronRight className="w-6 h-6" />
            </a>
          </div>
        )}

        {/* Verses List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
            Your Memory Verses
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Verse
          </button>
        </div>

        <div className="space-y-4">
          {verses.map((verse) => (
            <div
              key={verse.id}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                    {verse.reference}
                  </h3>
                  <span className="text-sm text-gray-500">{verse.translation}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[verse.status].bg
                  } ${statusColors[verse.status].text}`}
                >
                  {statusColors[verse.status].label}
                </span>
              </div>

              <p className="text-gray-700 mb-4 italic">"{verse.text}"</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Next: {verse.next_review}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    <span>{verse.repetitions} reviews</span>
                  </div>
                </div>
                <button className="text-amber-600 hover:text-amber-700 font-medium">
                  Practice Now →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {verses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              No Verses Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start building your memory bank by adding verses to memorize.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              Add Your First Verse
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
          <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            How Spaced Repetition Works
          </h3>
          <p className="text-gray-600">
            We use the SM-2 algorithm to optimize your memorization. Verses you know well
            are reviewed less frequently, while challenging verses appear more often.
            This scientific approach helps you memorize Scripture more effectively.
          </p>
        </div>
      </div>
    </div>
  );
}
