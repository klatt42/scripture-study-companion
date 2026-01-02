import DashboardHeader from '@/components/DashboardHeader';
import DashboardWelcome from '@/components/DashboardWelcome';

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      {/* Shared Header - pulls profile from settings */}
      <DashboardHeader />

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome section - pulls profile from settings */}
        <DashboardWelcome />

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Study Topic Explorer - Deep Blue */}
          <a href="/dashboard/study-topics" className="group">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 border-l-4 border-l-[var(--purple-deep)] p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-blue-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--purple-very-light)' }}>
                  <span className="text-2xl" style={{ color: 'var(--purple-deep)' }}>🔍</span>
                </div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                  Study Topic Explorer
                </h3>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-medium)' }}>
                Discover study topics with AI-powered suggestions and key questions
              </p>
              <span className="text-sm font-medium group-hover:underline" style={{ color: 'var(--purple-deep)' }}>
                Explore Topics →
              </span>
            </div>
          </a>

          {/* Study Guide Generator - Medium Blue */}
          <a href="/dashboard/study-guide" className="group">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 border-l-4 border-l-[var(--purple-medium)] p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-blue-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--purple-very-light)' }}>
                  <span className="text-2xl" style={{ color: 'var(--purple-medium)' }}>📋</span>
                </div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                  Study Guide Generator
                </h3>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-medium)' }}>
                Create structured study guides with context and discussion questions
              </p>
              <span className="text-sm font-medium group-hover:underline" style={{ color: 'var(--purple-medium)' }}>
                Generate Guide →
              </span>
            </div>
          </a>

          {/* Bible Search - Liturgical Green */}
          <a href="/dashboard/bible-search" className="group">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 border-l-4 border-l-[var(--green-liturgical)] p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-green-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8F5E9' }}>
                  <span className="text-2xl" style={{ color: 'var(--green-liturgical)' }}>📖</span>
                </div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                  Bible Search
                </h3>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-medium)' }}>
                Search scriptures across multiple translations
              </p>
              <span className="text-sm font-medium group-hover:underline" style={{ color: 'var(--green-liturgical)' }}>
                Search →
              </span>
            </div>
          </a>

          {/* Reading Plans - Teal (NEW) */}
          <a href="/dashboard/reading-plans" className="group">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 border-l-4 border-l-teal-600 p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-teal-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-100">
                  <span className="text-2xl text-teal-600">📚</span>
                </div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                  Reading Plans
                </h3>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-medium)' }}>
                Daily reading plans with progress tracking and streaks
              </p>
              <span className="text-sm font-medium group-hover:underline text-teal-600">
                Start Reading →
              </span>
            </div>
          </a>

          {/* Verse Memory - Amber (NEW) */}
          <a href="/dashboard/memory" className="group">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 border-l-4 border-l-amber-500 p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-amber-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-100">
                  <span className="text-2xl text-amber-600">🧠</span>
                </div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                  Verse Memory
                </h3>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-medium)' }}>
                Memorize Scripture with flashcards and spaced repetition
              </p>
              <span className="text-sm font-medium group-hover:underline text-amber-600">
                Practice →
              </span>
            </div>
          </a>

          {/* Passage Deep Dive - Purple */}
          <a href="/dashboard/deep-dive" className="group">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 border-l-4 border-l-violet-600 p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-violet-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-violet-100">
                  <span className="text-2xl text-violet-600">🔬</span>
                </div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                  Passage Deep Dive
                </h3>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-medium)' }}>
                Comprehensive passage analysis with word studies and context
              </p>
              <span className="text-sm font-medium group-hover:underline text-violet-600">
                Deep Dive →
              </span>
            </div>
          </a>

          {/* Hymn Finder - Light Purple */}
          <a href="/dashboard/hymn-finder" className="group">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 border-l-4 border-l-[var(--purple-light)] p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-purple-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--purple-very-light)' }}>
                  <span className="text-2xl" style={{ color: 'var(--purple-light)' }}>🎵</span>
                </div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                  Hymn Finder
                </h3>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-medium)' }}>
                Discover hymns by theme, season, and scripture
              </p>
              <span className="text-sm font-medium group-hover:underline" style={{ color: 'var(--purple-light)' }}>
                Browse Hymns →
              </span>
            </div>
          </a>

          {/* Theology Research - Sage Green */}
          <a href="/dashboard/theology-research" className="group">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 border-l-4 border-l-[var(--green-sage)] p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-green-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8F5E9' }}>
                  <span className="text-2xl" style={{ color: 'var(--green-sage)' }}>🕊️</span>
                </div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                  Theology Research
                </h3>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-medium)' }}>
                Deep-dive into theological topics and doctrines
              </p>
              <span className="text-sm font-medium group-hover:underline" style={{ color: 'var(--green-sage)' }}>
                Research →
              </span>
            </div>
          </a>

          {/* Study Groups - Rose (NEW) */}
          <a href="/dashboard/groups" className="group">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 border-l-4 border-l-rose-500 p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-rose-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-rose-100">
                  <span className="text-2xl text-rose-600">👥</span>
                </div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                  Study Groups
                </h3>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-medium)' }}>
                Join or create study groups for fellowship and discussion
              </p>
              <span className="text-sm font-medium group-hover:underline text-rose-600">
                Find Groups →
              </span>
            </div>
          </a>

          {/* My Study Guides - Medium Purple */}
          <a href="/dashboard/my-guides" className="group">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 border-l-4 border-l-[var(--purple-medium)] p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-purple-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--purple-very-light)' }}>
                  <span className="text-2xl" style={{ color: 'var(--purple-medium)' }}>📜</span>
                </div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                  My Study Guides
                </h3>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-medium)' }}>
                View and manage your saved study guides
              </p>
              <span className="text-sm font-medium group-hover:underline" style={{ color: 'var(--purple-medium)' }}>
                View Guides →
              </span>
            </div>
          </a>

          {/* Study Notes - Amber */}
          <a href="/dashboard/notes" className="group">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 border-l-4 border-l-[var(--amber)] p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-amber-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF9E6' }}>
                  <span className="text-2xl" style={{ color: 'var(--amber)' }}>📝</span>
                </div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                  Study Notes
                </h3>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-medium)' }}>
                Personal reflections and study insights
              </p>
              <span className="text-sm font-medium group-hover:underline" style={{ color: 'var(--amber)' }}>
                My Notes →
              </span>
            </div>
          </a>

          {/* Calendar - Gold */}
          <a href="/dashboard/calendar" className="group">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 border-l-4 border-l-[var(--gold)] p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-yellow-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF9E6' }}>
                  <span className="text-2xl" style={{ color: 'var(--gold)' }}>📅</span>
                </div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                  Study Calendar
                </h3>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-medium)' }}>
                Track study sessions and group meetings
              </p>
              <span className="text-sm font-medium group-hover:underline" style={{ color: 'var(--gold)' }}>
                View Calendar →
              </span>
            </div>
          </a>

          {/* Settings - Text Medium */}
          <a href="/dashboard/settings" className="group">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 border-l-4 border-l-[var(--text-medium)] p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-gray-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--warm-gray)' }}>
                  <span className="text-2xl" style={{ color: 'var(--text-medium)' }}>⚙️</span>
                </div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
                  Settings
                </h3>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-medium)' }}>
                Customize your preferences and account
              </p>
              <span className="text-sm font-medium group-hover:underline" style={{ color: 'var(--text-medium)' }}>
                Manage Settings →
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
