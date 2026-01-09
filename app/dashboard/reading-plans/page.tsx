'use client';

import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { BookOpen, Calendar, Flame, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  category: string;
  is_public: boolean;
  is_active?: boolean;
  progress?: {
    id: string;
    current_day: number;
    completed_days: number[];
    current_streak: number;
    longest_streak: number;
    percentage: number;
    started_at: string;
  };
}

export default function ReadingPlansPage() {
  const [activePlans, setActivePlans] = useState<ReadingPlan[]>([]);
  const [availablePlans, setAvailablePlans] = useState<ReadingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingPlan, setStartingPlan] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/reading-plans');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reading plans');
      }

      setAvailablePlans(data.plans || []);
      setActivePlans(data.activePlans || []);
    } catch (err: any) {
      console.error('Error fetching plans:', err);
      setError(err.message || 'Failed to load reading plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleStartPlan = async (planId: string) => {
    try {
      setStartingPlan(planId);
      const response = await fetch('/api/reading-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start plan');
      }

      // Refresh the plans list
      await fetchPlans();
    } catch (err: any) {
      console.error('Error starting plan:', err);
      setError(err.message || 'Failed to start plan');
    } finally {
      setStartingPlan(null);
    }
  };

  const handleStopPlan = async (planId: string) => {
    if (!confirm('Are you sure you want to stop this reading plan? Your progress will be lost.')) {
      return;
    }

    try {
      const response = await fetch(`/api/reading-plans?plan_id=${planId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to stop plan');
      }

      // Refresh the plans list
      await fetchPlans();
    } catch (err: any) {
      console.error('Error stopping plan:', err);
      setError(err.message || 'Failed to stop plan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackLink pageTitle="Reading Plans" pageIcon="📚" colorScheme="green" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        showBackLink
        pageTitle="Reading Plans"
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

        {/* Active Plans Section */}
        {activePlans.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
              Your Active Plans
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-xl shadow-md border-l-4 border-l-teal-600 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-500">{plan.category}</p>
                    </div>
                    <div className="flex items-center gap-1 text-orange-500">
                      <Flame className="w-5 h-5" />
                      <span className="font-bold">{plan.progress?.current_streak || 0}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-teal-600">{plan.progress?.percentage || 0}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all"
                        style={{ width: `${plan.progress?.percentage || 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Day {plan.progress?.current_day || 1}</span>
                      <span>{plan.progress?.completed_days?.length || 0} / {plan.duration_days} days</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`/dashboard/reading-plans/${plan.id}`}
                      className="flex-1 flex items-center justify-between py-2 px-4 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      <span className="font-medium">Continue Reading</span>
                      <ChevronRight className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleStopPlan(plan.id)}
                      className="px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Stop this plan"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Plans Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
            Available Reading Plans
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availablePlans.map((plan) => {
              const isActive = activePlans.some((p) => p.id === plan.id);
              const isStarting = startingPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all border border-gray-200"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-500">{plan.category}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{plan.duration_days} days</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartPlan(plan.id)}
                    disabled={isActive || isStarting}
                    className="w-full py-2 px-4 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isStarting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isActive ? 'Already Active' : isStarting ? 'Starting...' : 'Start Plan'}
                  </button>
                </div>
              );
            })}
          </div>

          {availablePlans.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reading plans available yet.</p>
            </div>
          )}
        </div>

        {/* Coming Soon: Custom Plans */}
        <div className="mt-10 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200">
          <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Coming Soon: Custom Reading Plans
          </h3>
          <p className="text-gray-600">
            Create your own reading plan by selecting books, chapters, and duration.
            Perfect for group studies or personal goals.
          </p>
        </div>
      </div>
    </div>
  );
}
