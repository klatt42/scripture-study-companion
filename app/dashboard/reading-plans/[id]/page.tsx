'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Circle,
  Flame,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Trophy
} from 'lucide-react';

interface ReadingDay {
  id: string;
  day_number: number;
  passages: string[];
  reflection_prompt: string | null;
}

interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  category: string;
}

interface UserProgress {
  id: string;
  current_day: number;
  completed_days: number[];
  current_streak: number;
  longest_streak: number;
  last_read_date: string | null;
  started_at: string;
  completed_at: string | null;
}

export default function ReadingPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [days, setDays] = useState<ReadingDay[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [updatingDay, setUpdatingDay] = useState<number | null>(null);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/reading-plans/${resolvedParams.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reading plan');
      }

      setPlan(data.plan);
      setDays(data.days || []);
      setProgress(data.progress);

      // Set selected day to current day or first incomplete day
      if (data.progress) {
        setSelectedDay(data.progress.current_day || 1);
      }
    } catch (err: any) {
      console.error('Error fetching plan:', err);
      setError(err.message || 'Failed to load reading plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanDetails();
  }, [resolvedParams.id]);

  const handleMarkComplete = async (dayNumber: number) => {
    if (!progress) {
      setError('Please start this reading plan first from the Reading Plans page.');
      return;
    }

    const isCompleted = progress.completed_days.includes(dayNumber);
    const action = isCompleted ? 'uncomplete' : 'complete';

    try {
      setUpdatingDay(dayNumber);
      const response = await fetch(`/api/reading-plans/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_number: dayNumber, action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update progress');
      }

      // Update local progress state
      setProgress(data.progress);
    } catch (err: any) {
      console.error('Error updating progress:', err);
      setError(err.message || 'Failed to update progress');
    } finally {
      setUpdatingDay(null);
    }
  };

  const progressPercentage = progress && plan
    ? Math.round((progress.completed_days.length / plan.duration_days) * 100)
    : 0;

  const currentDayData = days.find((d) => d.day_number === selectedDay);
  const isDayCompleted = progress?.completed_days.includes(selectedDay) || false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackLink pageTitle="Loading..." pageIcon="📚" colorScheme="green" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackLink pageTitle="Error" pageIcon="📚" colorScheme="green" />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/dashboard/reading-plans" className="text-teal-600 hover:underline">
            ← Back to Reading Plans
          </Link>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackLink pageTitle="Plan Not Found" pageIcon="📚" colorScheme="green" />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">This reading plan could not be found.</p>
          <Link href="/dashboard/reading-plans" className="text-teal-600 hover:underline mt-4 inline-block">
            ← Back to Reading Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        showBackLink
        backLinkHref="/dashboard/reading-plans"
        pageTitle={plan.name}
        pageIcon="📚"
        colorScheme="green"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              Dismiss
            </button>
          </div>
        )}

        {/* Not Started Banner */}
        {!progress && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span className="text-amber-800">
              You haven&apos;t started this plan yet.{' '}
              <Link href="/dashboard/reading-plans" className="font-medium underline">
                Go back to start it
              </Link>
              .
            </span>
          </div>
        )}

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                {plan.name}
              </h2>
              <p className="text-teal-100 mt-1">{plan.description}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Flame className="w-5 h-5 text-orange-300" />
                  <span className="text-2xl font-bold">{progress?.current_streak || 0}</span>
                </div>
                <span className="text-xs text-teal-100">Day Streak</span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold">{progressPercentage}%</span>
                <div className="text-xs text-teal-100">Complete</div>
              </div>
              {progress?.longest_streak && progress.longest_streak > 0 && (
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Trophy className="w-5 h-5 text-yellow-300" />
                    <span className="text-2xl font-bold">{progress.longest_streak}</span>
                  </div>
                  <span className="text-xs text-teal-100">Best Streak</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1 text-teal-100">
              <span>Day {progress?.current_day || 1} of {plan.duration_days}</span>
              <span>{progress?.completed_days.length || 0} days completed</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Day List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                  Reading Schedule
                </h3>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  {showCalendar ? 'List View' : 'Calendar'}
                </button>
              </div>

              {days.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reading schedule available.</p>
                  <p className="text-sm mt-2">Please run the seed script to populate reading days.</p>
                </div>
              ) : showCalendar ? (
                <div className="p-4">
                  {/* Simple Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <div key={i} className="font-medium text-gray-500 py-1">
                        {d}
                      </div>
                    ))}
                    {days.slice(0, 35).map((day) => {
                      const isCompleted = progress?.completed_days.includes(day.day_number);
                      const isCurrent = day.day_number === (progress?.current_day || 1);
                      return (
                        <button
                          key={day.day_number}
                          onClick={() => setSelectedDay(day.day_number)}
                          className={`p-2 rounded-lg transition-all ${
                            selectedDay === day.day_number
                              ? 'bg-teal-600 text-white'
                              : isCompleted
                              ? 'bg-green-100 text-green-700'
                              : isCurrent
                              ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-500'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {day.day_number}
                        </button>
                      );
                    })}
                  </div>
                  {days.length > 35 && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Showing first 35 days
                    </p>
                  )}
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto">
                  {days
                    .slice(
                      Math.max(0, (progress?.current_day || 1) - 3),
                      (progress?.current_day || 1) + 7
                    )
                    .map((day) => {
                      const isCompleted = progress?.completed_days.includes(day.day_number);
                      const isCurrent = day.day_number === (progress?.current_day || 1);
                      return (
                        <button
                          key={day.day_number}
                          onClick={() => setSelectedDay(day.day_number)}
                          className={`w-full p-4 border-b border-gray-100 flex items-center gap-3 transition-all ${
                            selectedDay === day.day_number
                              ? 'bg-teal-50'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : isCurrent ? (
                            <div className="w-5 h-5 rounded-full border-2 border-teal-500 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          )}
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm">
                              Day {day.day_number}
                              {isCurrent && (
                                <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {day.passages.join(' • ')}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Day Detail */}
          <div className="lg:col-span-2">
            {currentDayData ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                      disabled={selectedDay === 1}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                        Day {currentDayData.day_number}
                      </h2>
                      <p className="text-gray-500">{plan.category}</p>
                    </div>
                    <button
                      onClick={() => setSelectedDay(Math.min(plan.duration_days, selectedDay + 1))}
                      disabled={selectedDay === plan.duration_days}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleMarkComplete(currentDayData.day_number)}
                    disabled={!progress || updatingDay === currentDayData.day_number}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      isDayCompleted
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {updatingDay === currentDayData.day_number ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isDayCompleted ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </>
                    ) : (
                      'Mark Complete'
                    )}
                  </button>
                </div>

                {/* Passages */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                    Today&apos;s Readings
                  </h3>
                  {currentDayData.passages.map((passage, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-teal-600" />
                        <span className="font-medium">{passage}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Click to open in Bible Search for reading and study.
                      </p>
                      <a
                        href={`/dashboard/bible-search?q=${encodeURIComponent(passage)}`}
                        className="mt-3 inline-flex items-center text-sm text-teal-600 hover:text-teal-700"
                      >
                        Read this passage →
                      </a>
                    </div>
                  ))}
                </div>

                {/* Reflection Questions */}
                <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
                  <h3 className="font-semibold text-amber-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                    Reflection Questions
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    {currentDayData.reflection_prompt && (
                      <li className="flex gap-2">
                        <span className="text-amber-600 font-bold">1.</span>
                        {currentDayData.reflection_prompt}
                      </li>
                    )}
                    <li className="flex gap-2">
                      <span className="text-amber-600 font-bold">{currentDayData.reflection_prompt ? '2' : '1'}.</span>
                      What stood out to you most in today&apos;s reading?
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600 font-bold">{currentDayData.reflection_prompt ? '3' : '2'}.</span>
                      How can you apply this to your life today?
                    </li>
                  </ul>
                </div>

                {/* Notes Section */}
                <div className="mt-8">
                  <h3 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                    Your Notes
                  </h3>
                  <textarea
                    placeholder="Write your thoughts, observations, or prayers here..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <div className="flex justify-end mt-2">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                      Save Notes
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Select a day from the schedule to view readings.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
