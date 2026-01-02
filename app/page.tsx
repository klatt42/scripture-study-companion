import Link from 'next/link';
import {
  Lightbulb,
  BookOpen,
  Music,
  Calendar,
  UserPlus,
  Sparkles,
  ArrowRight,
  CheckCircle,
  BookMarked,
  Brain,
  Users
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border-gray">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg liturgical-gradient flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-purple-deep" style={{ fontFamily: 'Georgia, serif' }}>
                Scripture Study Companion
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-text-medium hover:text-purple-deep transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-lg liturgical-gradient text-white font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto" style={{ textAlign: 'center' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-tint text-purple-deep text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Your AI Study Companion
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-dark mb-6 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Go Deeper in
            <span className="block text-purple-deep">Scripture Study</span>
          </h1>
          <p style={{ display: 'block', width: '100%', maxWidth: '42rem', margin: '0 auto 2rem auto', whiteSpace: 'normal' }} className="text-xl text-text-medium leading-relaxed">
            Your personal guide to deeper Bible study. Generate study guides, track reading plans, memorize verses, and grow in understanding — whether studying alone or with a group.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl liturgical-gradient text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white border-2 border-purple-light text-purple-deep font-semibold text-lg hover:bg-purple-tint transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-warm-gray">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16" style={{ textAlign: 'center' }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-dark mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Your Study Toolkit
            </h2>
            <p style={{ display: 'block', width: '100%', maxWidth: '42rem', margin: '0 auto', whiteSpace: 'normal' }} className="text-lg text-text-medium">
              AI-powered tools designed to help you understand and apply Scripture more deeply.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-tint flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-purple-deep" />
              </div>
              <h3 className="text-xl font-semibold text-text-dark mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Study Guide Generator
              </h3>
              <p className="text-text-medium">
                AI creates comprehensive study guides with context, discussion questions, and cross-references for any passage.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-sage/20 flex items-center justify-center mb-4">
                <BookMarked className="w-6 h-6 text-green-liturgical" />
              </div>
              <h3 className="text-xl font-semibold text-text-dark mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Reading Plans
              </h3>
              <p className="text-text-medium">
                Follow pre-built or custom reading plans with daily tracking, streaks, and reflection prompts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber/20 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-xl font-semibold text-text-dark mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Verse Memory
              </h3>
              <p className="text-text-medium">
                Memorize Scripture with flashcards using proven spaced repetition techniques for lasting retention.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-crimson/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-crimson" />
              </div>
              <h3 className="text-xl font-semibold text-text-dark mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Study Groups
              </h3>
              <p className="text-text-medium">
                Create or join study groups for shared reading plans, discussions, and accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-dark mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              How It Works
            </h2>
            <p className="text-lg text-text-medium">
              Start your deeper Scripture study journey in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full liturgical-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm font-semibold text-purple-medium mb-2">Step 1</div>
              <h3 className="text-xl font-semibold text-text-dark mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Sign Up Free
              </h3>
              <p className="text-text-medium">
                Create your account in seconds. No credit card required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full liturgical-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm font-semibold text-purple-medium mb-2">Step 2</div>
              <h3 className="text-xl font-semibold text-text-dark mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Choose Your Study
              </h3>
              <p className="text-text-medium">
                Pick a reading plan, generate a study guide, or start memorizing verses.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full liturgical-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm font-semibold text-purple-medium mb-2">Step 3</div>
              <h3 className="text-xl font-semibold text-text-dark mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Grow in Understanding
              </h3>
              <p className="text-text-medium">
                Get AI-powered insights, track your progress, and go deeper in God's Word.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 liturgical-gradient">
        <div className="max-w-4xl mx-auto" style={{ textAlign: 'center' }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Ready to Go Deeper?
          </h2>
          <p style={{ display: 'block', width: '100%', maxWidth: '42rem', margin: '0 auto 2rem auto', whiteSpace: 'normal' }} className="text-xl text-purple-very-light">
            Join thousands who are transforming their Bible study with AI-powered tools — making every moment in Scripture more meaningful.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-purple-deep font-semibold text-lg hover:bg-purple-tint transition-colors shadow-lg"
          >
            Start Studying Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border-gray">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md liturgical-gradient flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-text-medium">
              Scripture Study Companion
            </span>
          </div>
          <p className="text-text-light text-sm">
            &copy; {new Date().getFullYear()} Scripture Study Companion. Your personal guide to deeper Scripture study.
          </p>
        </div>
      </footer>
    </div>
  );
}
