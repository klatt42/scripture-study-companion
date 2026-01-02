'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { Clock, Calendar, BookOpen, Target, TrendingUp, ChevronRight, Plus } from 'lucide-react';

interface StudySession {
  id: string;
  date: string;
  duration_minutes: number;
  passage?: string;
  notes?: string;
  type: 'reading' | 'study' | 'memory' | 'prayer';
}

const SAMPLE_SESSIONS: StudySession[] = [
  {
    id: '1',
    date: 'Today',
    duration_minutes: 25,
    passage: 'John 3:1-21',
    notes: 'Studied Nicodemus conversation with Jesus',
    type: 'study',
  },
  {
    id: '2',
    date: 'Yesterday',
    duration_minutes: 15,
    passage: 'Psalm 23',
    type: 'reading',
  },
  {
    id: '3',
    date: '2 days ago',
    duration_minutes: 20,
    notes: 'Reviewed memory verses',
    type: 'memory',
  },
];

const typeColors = {
  reading: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Reading' },
  study: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Study' },
  memory: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Memory' },
  prayer: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Prayer' },
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<StudySession[]>(SAMPLE_SESSIONS);
  const [showLogModal, setShowLogModal] = useState(false);

  // Calculate stats
  const stats = {
    totalSessions: sessions.length,
    totalMinutes: sessions.reduce((acc, s) => acc + s.duration_minutes, 0),
    currentStreak: 3, // Calculated from consecutive days
    weeklyGoal: 120, // minutes per week
    weeklyProgress: 60,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        showBackLink
        pageTitle="Study Sessions"
        pageIcon="📊"
        colorScheme="purple"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-violet-500">
            <div className="text-2xl font-bold text-violet-600">{stats.totalSessions}</div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-teal-500">
            <div className="text-2xl font-bold text-teal-600">{stats.totalMinutes} min</div>
            <div className="text-sm text-gray-600">Time in Word</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-orange-500">
            <div className="text-2xl font-bold text-orange-600">{stats.currentStreak} days</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}%
              </div>
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-sm text-gray-600">Weekly Goal</div>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
              This Week's Progress
            </h3>
            <span className="text-sm text-gray-500">
              {stats.weeklyProgress} / {stats.weeklyGoal} minutes
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${Math.min((stats.weeklyProgress / stats.weeklyGoal) * 100, 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {stats.weeklyGoal - stats.weeklyProgress > 0
              ? `${stats.weeklyGoal - stats.weeklyProgress} more minutes to reach your goal!`
              : 'Goal reached! Keep up the great work!'}
          </p>
        </div>

        {/* Recent Sessions */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
            Recent Sessions
          </h2>
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Session
          </button>
        </div>

        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                        {session.duration_minutes} minutes
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          typeColors[session.type].bg
                        } ${typeColors[session.type].text}`}
                      >
                        {typeColors[session.type].label}
                      </span>
                    </div>
                    {session.passage && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{session.passage}</span>
                      </div>
                    )}
                    {session.notes && (
                      <p className="text-sm text-gray-500">{session.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{session.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sessions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              No Sessions Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start tracking your study sessions to see your progress over time.
            </p>
            <button
              onClick={() => setShowLogModal(true)}
              className="px-6 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
            >
              Log Your First Session
            </button>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
          <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Build Consistent Habits
          </h3>
          <p className="text-gray-600 mb-3">
            Research shows that 15-20 minutes of daily Scripture reading is more effective
            than sporadic longer sessions. Set a realistic weekly goal and build from there.
          </p>
          <button className="text-violet-600 font-medium hover:text-violet-700">
            Adjust Weekly Goal →
          </button>
        </div>
      </div>
    </div>
  );
}
