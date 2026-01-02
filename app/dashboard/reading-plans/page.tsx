'use client';

import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { BookOpen, Calendar, CheckCircle, Clock, Flame, ChevronRight } from 'lucide-react';

interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  category: string;
  is_active?: boolean;
  progress?: number;
  current_streak?: number;
}

const SAMPLE_PLANS: ReadingPlan[] = [
  {
    id: '1',
    name: 'Bible in a Year',
    description: 'Read through the entire Bible in 365 days with daily Old Testament, New Testament, and Psalms readings.',
    duration_days: 365,
    category: 'Comprehensive',
  },
  {
    id: '2',
    name: 'Gospels Deep Dive',
    description: 'Spend 90 days exploring Matthew, Mark, Luke, and John with reflection questions.',
    duration_days: 90,
    category: 'New Testament',
  },
  {
    id: '3',
    name: 'Psalms & Proverbs',
    description: 'Daily wisdom and worship readings from Psalms and Proverbs over 31 days.',
    duration_days: 31,
    category: 'Wisdom Literature',
  },
  {
    id: '4',
    name: 'Lenten Journey',
    description: '40 days of readings following Jesus from temptation to resurrection.',
    duration_days: 40,
    category: 'Seasonal',
  },
];

export default function ReadingPlansPage() {
  const [activePlans, setActivePlans] = useState<ReadingPlan[]>([]);
  const [availablePlans, setAvailablePlans] = useState<ReadingPlan[]>(SAMPLE_PLANS);
  const [loading, setLoading] = useState(false);

  // Simulated active plan for demo
  useEffect(() => {
    // In production, fetch from API
    setActivePlans([
      {
        ...SAMPLE_PLANS[0],
        is_active: true,
        progress: 45,
        current_streak: 7,
      },
    ]);
  }, []);

  const handleStartPlan = (plan: ReadingPlan) => {
    // In production, call API to start plan
    setActivePlans([...activePlans, { ...plan, is_active: true, progress: 0, current_streak: 0 }]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        showBackLink
        pageTitle="Reading Plans"
        pageIcon="📚"
        colorScheme="green"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      <span className="font-bold">{plan.current_streak}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-teal-600">{plan.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all"
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                  </div>

                  <a
                    href={`/dashboard/reading-plans/${plan.id}`}
                    className="flex items-center justify-between w-full py-2 px-4 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    <span className="font-medium">Continue Reading</span>
                    <ChevronRight className="w-5 h-5" />
                  </a>
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
            {availablePlans.map((plan) => (
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
                  onClick={() => handleStartPlan(plan)}
                  disabled={activePlans.some((p) => p.id === plan.id)}
                  className="w-full py-2 px-4 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {activePlans.some((p) => p.id === plan.id) ? 'Already Active' : 'Start Plan'}
                </button>
              </div>
            ))}
          </div>
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
