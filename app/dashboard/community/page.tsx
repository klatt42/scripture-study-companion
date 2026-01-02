'use client';

import DashboardHeader from '@/components/DashboardHeader';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50">
      {/* Shared Header with crimson color scheme */}
      <DashboardHeader
        showBackLink
        pageTitle="Community"
        pageIcon="⛪"
        colorScheme="crimson"
      />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Coming Soon Banner */}
        <div
          className="w-full rounded-2xl shadow-xl mb-12"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #7c3aed 100%)',
            padding: '48px 32px'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>🤝</span>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px',
              fontFamily: 'Georgia, serif'
            }}>
              Community Feature Coming Soon!
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#ccfbf1',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              We&apos;re building something special to connect pastors and ministry leaders in meaningful ways.
            </p>
          </div>
        </div>

        {/* Vision Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            💡 Our Vision
          </h3>
          <div className="space-y-4 text-gray-700">
            <p className="text-lg">
              Ministry can feel isolating. You pour your heart into sermon preparation, pastoral care, and leadership - often without peers who truly understand the unique challenges you face.
            </p>
            <p className="text-lg">
              We envision a community where you can:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="flex items-start gap-3">
                <span className="text-teal-600 font-bold text-xl">✓</span>
                <span><strong>Share sermon outlines</strong> and get constructive feedback from fellow pastors</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-teal-600 font-bold text-xl">✓</span>
                <span><strong>Ask theological questions</strong> and engage in respectful, edifying discussions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-teal-600 font-bold text-xl">✓</span>
                <span><strong>Find mentorship</strong> from experienced ministry leaders or mentor emerging pastors</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-teal-600 font-bold text-xl">✓</span>
                <span><strong>Share resources</strong> like illustrations, research, books, and practical ministry tools</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-teal-600 font-bold text-xl">✓</span>
                <span><strong>Pray for one another</strong> through the challenges and victories of ministry life</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-teal-600 font-bold text-xl">✓</span>
                <span><strong>Connect locally or globally</strong> based on your needs and preferences</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Help Us Build Section */}
        <div className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-xl shadow-sm border border-purple-200 p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🛠️ Help Us Build What You Need
          </h3>
          <p className="text-gray-700 mb-6 text-lg">
            We want to create a community that truly serves your needs. Here are some questions we're wrestling with:
          </p>

          <div className="space-y-6">
            {/* Question 1 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-purple-600">1.</span> Who should be part of this community?
              </h4>
              <ul className="ml-6 space-y-2 text-gray-600">
                <li>• Pastors and ministry leaders only (verified credentials)?</li>
                <li>• Any Christian seeking to grow in faith and biblical knowledge?</li>
                <li>• A hybrid model with pastor-only sections + open forums?</li>
              </ul>
            </div>

            {/* Question 2 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-purple-600">2.</span> What's the primary purpose?
              </h4>
              <ul className="ml-6 space-y-2 text-gray-600">
                <li>• Combat pastoral isolation and provide peer support?</li>
                <li>• Get feedback on sermon ideas and outlines?</li>
                <li>• Share and discover ministry resources?</li>
                <li>• Theological discussion and peer review?</li>
                <li>• Prayer requests and spiritual encouragement?</li>
              </ul>
            </div>

            {/* Question 3 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-purple-600">3.</span> How should people connect?
              </h4>
              <ul className="ml-6 space-y-2 text-gray-600">
                <li>• Local connections (pastors in your city/region)?</li>
                <li>• Global network (connect with anyone worldwide)?</li>
                <li>• Denomination-specific channels?</li>
                <li>• Topic-based forums (youth ministry, preaching, counseling, etc.)?</li>
              </ul>
            </div>

            {/* Question 4 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-purple-600">4.</span> What format works best?
              </h4>
              <ul className="ml-6 space-y-2 text-gray-600">
                <li>• Discussion forums (like Reddit - threaded conversations)?</li>
                <li>• Q&A format (like Stack Overflow - questions with voted answers)?</li>
                <li>• Real-time chat (like Slack - instant messaging channels)?</li>
                <li>• Social feed (like Facebook - posts, comments, reactions)?</li>
              </ul>
            </div>

            {/* Question 5 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-purple-600">5.</span> Privacy and safety considerations
              </h4>
              <ul className="ml-6 space-y-2 text-gray-600">
                <li>• Should there be anonymous posting for sensitive questions?</li>
                <li>• How do we maintain theological integrity and respectful dialogue?</li>
                <li>• Private spaces for church staff teams to collaborate?</li>
                <li>• Moderation approach (community-driven vs. curated)?</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Proposed Features Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🎯 Potential Features We're Considering
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💬</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Discussion Forums</h4>
                <p className="text-gray-600 text-sm">Topic-based conversations on theology, ministry practices, and pastoral care</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">📝</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Sermon Feedback</h4>
                <p className="text-gray-600 text-sm">Share outlines and ideas, receive constructive peer review</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">🙏</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Prayer Requests</h4>
                <p className="text-gray-600 text-sm">Support one another through ministry challenges and celebrations</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">📚</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Resource Library</h4>
                <p className="text-gray-600 text-sm">Community-curated collection of books, articles, and tools</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">🎓</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Mentor Matching</h4>
                <p className="text-gray-600 text-sm">Connect experienced pastors with those newer to ministry</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">⛪</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Denomination Channels</h4>
                <p className="text-gray-600 text-sm">Spaces for tradition-specific discussions and resources</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-lg mb-6">
            We&apos;d love to hear your thoughts on what would make this community most valuable to you!
          </p>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 inline-block">
            <p className="text-teal-900 font-medium mb-2">Have ideas or feedback?</p>
            <p className="text-teal-700 text-sm">
              Email us at{' '}
              <a href="mailto:Ron@bizinsiderpro.com" className="underline font-semibold">
                Ron@bizinsiderpro.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
