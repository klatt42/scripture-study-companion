'use client';

import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { Clock, Calendar, BookOpen, Target, TrendingUp, Plus, Trash2 } from 'lucide-react';

interface StudySession {
  id: string;
  date: string;
  session_date: string;
  duration_minutes: number;
  passage?: string;
  notes?: string;
  type: 'reading' | 'study' | 'memory' | 'prayer';
}

interface Stats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  typeBreakdown: {
    reading: number;
    study: number;
    memory: number;
    prayer: number;
  };
}

const typeColors = {
  reading: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Reading' },
  study: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Study' },
  memory: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Memory' },
  prayer: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Prayer' },
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSession, setNewSession] = useState({
    duration_minutes: 15,
    passage: '',
    notes: '',
    session_type: 'reading',
    session_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch sessions and stats in parallel
      const [sessionsRes, statsRes] = await Promise.all([
        fetch('/api/sessions'),
        fetch('/api/sessions/stats'),
      ]);

      const sessionsData = await sessionsRes.json();
      const statsData = await statsRes.json();

      if (!sessionsRes.ok) throw new Error(sessionsData.error);
      if (!statsRes.ok) throw new Error(statsData.error);

      setSessions(sessionsData.sessions || []);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSession.duration_minutes < 1) return;

    try {
      setCreating(true);
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Add new session to list and refresh stats
      setSessions([data.session, ...sessions]);
      setShowLogModal(false);
      setNewSession({
        duration_minutes: 15,
        passage: '',
        notes: '',
        session_type: 'reading',
        session_date: new Date().toISOString().split('T')[0],
      });

      // Refresh stats
      const statsRes = await fetch('/api/sessions/stats');
      const statsData = await statsRes.json();
      if (statsRes.ok) setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Delete this study session?')) return;

    try {
      const response = await fetch(`/api/sessions?session_id=${sessionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setSessions(sessions.filter(s => s.id !== sessionId));

      // Refresh stats
      const statsRes = await fetch('/api/sessions/stats');
      const statsData = await statsRes.json();
      if (statsRes.ok) setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          showBackLink
          pageTitle="Study Sessions"
          pageIcon="📊"
          colorScheme="purple"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        showBackLink
        pageTitle="Study Sessions"
        pageIcon="📊"
        colorScheme="purple"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-violet-500">
            <div className="text-2xl font-bold text-violet-600">{stats?.totalSessions || 0}</div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-teal-500">
            <div className="text-2xl font-bold text-teal-600">{stats?.totalMinutes || 0} min</div>
            <div className="text-sm text-gray-600">Time in Word</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-orange-500">
            <div className="text-2xl font-bold text-orange-600">{stats?.currentStreak || 0} days</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">
                {stats ? Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100) : 0}%
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
              This Week&apos;s Progress
            </h3>
            <span className="text-sm text-gray-500">
              {stats?.weeklyProgress || 0} / {stats?.weeklyGoal || 120} minutes
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${Math.min(((stats?.weeklyProgress || 0) / (stats?.weeklyGoal || 120)) * 100, 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {stats && stats.weeklyGoal - stats.weeklyProgress > 0
              ? `${stats.weeklyGoal - stats.weeklyProgress} more minutes to reach your goal!`
              : 'Goal reached! Keep up the great work!'}
          </p>

          {/* Type Breakdown */}
          {stats && stats.weeklyProgress > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">This week by type:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.typeBreakdown).map(([type, minutes]) => (
                  minutes > 0 && (
                    <span
                      key={type}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[type as keyof typeof typeColors].bg} ${typeColors[type as keyof typeof typeColors].text}`}
                    >
                      {typeColors[type as keyof typeof typeColors].label}: {minutes}m
                    </span>
                  )
                ))}
              </div>
            </div>
          )}
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

        {sessions.length === 0 ? (
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
        ) : (
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
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{session.date}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
        </div>
      </div>

      {/* Log Session Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Log Study Session</h2>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newSession.session_date}
                  onChange={(e) => setNewSession({ ...newSession, session_date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newSession.duration_minutes}
                  onChange={(e) => setNewSession({ ...newSession, duration_minutes: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="480"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Quick presets:</p>
                <div className="flex gap-2 mt-1">
                  {[10, 15, 20, 30, 45, 60].map(min => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setNewSession({ ...newSession, duration_minutes: min })}
                      className={`px-2 py-1 text-xs rounded ${
                        newSession.duration_minutes === min
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(typeColors).map(([type, colors]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewSession({ ...newSession, session_type: type })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        newSession.session_type === type
                          ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-violet-500`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {colors.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Passage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passage (optional)
                </label>
                <input
                  type="text"
                  value={newSession.passage}
                  onChange={(e) => setNewSession({ ...newSession, passage: e.target.value })}
                  placeholder="e.g., John 3:1-21"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  placeholder="What did you learn or observe?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || newSession.duration_minutes < 1}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Logging...
                    </>
                  ) : (
                    'Log Session'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
