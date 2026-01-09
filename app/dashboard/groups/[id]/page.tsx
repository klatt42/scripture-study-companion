'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import {
  Users,
  BookOpen,
  MessageCircle,
  Calendar,
  Settings,
  Send,
  ChevronRight,
  User,
  Loader2,
  AlertCircle,
  LogOut,
  Shield,
  Crown,
  Trash2,
  X
} from 'lucide-react';

interface GroupMember {
  id: string;
  user_id: string;
  name: string;
  role: 'admin' | 'leader' | 'member';
  joined_at: string;
  avatar_url?: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  author_id: string;
  avatar_url?: string;
  created_at: string;
  comment_count: number;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  current_study?: string;
  meeting_schedule?: string;
  is_public: boolean;
  member_count: number;
  created_by: string;
}

interface Membership {
  role?: string;
  joined_at?: string;
  is_member: boolean;
}

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'discussions' | 'study' | 'members'>('discussions');

  // New post state
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('discussion');
  const [posting, setPosting] = useState(false);

  // Actions state
  const [leaving, setLeaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Fetch group data
  const fetchGroup = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/groups/${resolvedParams.id}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch group');
      }

      const data = await response.json();
      setGroup(data.group);
      setMembers(data.members || []);
      setPosts(data.posts || []);
      setMembership(data.membership);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [resolvedParams.id]);

  // Create a new post
  const handlePost = async () => {
    if (!newPostContent.trim() || !membership?.is_member) return;

    setPosting(true);
    try {
      const response = await fetch(`/api/groups/${resolvedParams.id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPostTitle.trim() || `${postCategory.charAt(0).toUpperCase() + postCategory.slice(1)} Post`,
          content: newPostContent,
          category: postCategory,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      const data = await response.json();
      setPosts((prev) => [data.post, ...prev]);
      setNewPostTitle('');
      setNewPostContent('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPosting(false);
    }
  };

  // Delete a post
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/groups/${resolvedParams.id}/posts?post_id=${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete post');
      }

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Leave the group
  const handleLeaveGroup = async () => {
    setLeaving(true);
    try {
      const response = await fetch(`/api/groups/${resolvedParams.id}/members`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to leave group');
      }

      router.push('/dashboard/groups');
    } catch (err: any) {
      alert(err.message);
      setLeaving(false);
      setShowLeaveConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'leader':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-amber-100 text-amber-700',
      leader: 'bg-blue-100 text-blue-700',
      member: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${styles[role] || styles.member}`}>
        {role}
      </span>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      discussion: 'bg-rose-100 text-rose-700',
      question: 'bg-blue-100 text-blue-700',
      prayer: 'bg-purple-100 text-purple-700',
      resource: 'bg-green-100 text-green-700',
      testimony: 'bg-amber-100 text-amber-700',
    };
    return colors[category] || colors.discussion;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackLink pageTitle="Loading..." pageIcon="👥" colorScheme="crimson" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
          <span className="ml-2 text-gray-600">Loading group...</span>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackLink pageTitle="Error" pageIcon="👥" colorScheme="crimson" />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p className="text-gray-600 mb-4">{error || 'Group not found'}</p>
          <Link href="/dashboard/groups" className="text-rose-600 hover:underline">
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        showBackLink
        backLinkHref="/dashboard/groups"
        pageTitle={group.name}
        pageIcon="👥"
        colorScheme="crimson"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Group Header Card */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                {group.name}
              </h1>
              <p className="text-rose-100">{group.description || 'No description'}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold">{members.length}</div>
                <div className="text-xs text-rose-100">Members</div>
              </div>
              {membership?.is_member && membership.role === 'admin' && (
                <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Current Study Info */}
          <div className="mt-6 flex flex-wrap gap-4">
            {group.current_study && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <BookOpen className="w-5 h-5" />
                <div>
                  <div className="text-xs text-rose-100">Current Study</div>
                  <div className="font-medium">{group.current_study}</div>
                </div>
              </div>
            )}
            {group.meeting_schedule && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <Calendar className="w-5 h-5" />
                <div>
                  <div className="text-xs text-rose-100">Meeting Schedule</div>
                  <div className="font-medium">{group.meeting_schedule}</div>
                </div>
              </div>
            )}
            {membership?.is_member && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <User className="w-5 h-5" />
                <div>
                  <div className="text-xs text-rose-100">Your Role</div>
                  <div className="font-medium capitalize">{membership.role}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Not a member banner */}
        {!membership?.is_member && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span className="text-amber-700">You are viewing this group as a non-member. Join to participate in discussions.</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('discussions')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'discussions'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Discussions ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab('study')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'study'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Study Materials
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'members'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Users className="w-4 h-4" />
                Members ({members.length})
              </button>
            </div>

            {/* Discussions Tab */}
            {activeTab === 'discussions' && (
              <div className="space-y-4">
                {/* New Post Box (only for members) */}
                {membership?.is_member && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['discussion', 'question', 'prayer', 'resource', 'testimony'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setPostCategory(cat)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition capitalize ${
                            postCategory === cat ? getCategoryColor(cat) : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Title (optional)"
                      className="w-full p-2 mb-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder={`Share a ${postCategory}...`}
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handlePost}
                        disabled={!newPostContent.trim() || posting}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {posting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Post
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Discussion List */}
                {posts.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No discussions yet. Be the first to post!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-rose-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{post.author}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(post.category)}`}>
                              {post.category}
                            </span>
                            <span className="text-sm text-gray-500">{formatDate(post.created_at)}</span>
                          </div>
                          {post.title && (
                            <h4 className="font-semibold text-gray-900 mb-1">{post.title}</h4>
                          )}
                          <p className="text-gray-700">{post.content}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <MessageCircle className="w-4 h-4" />
                              {post.comment_count} comments
                            </span>
                            {(membership?.role === 'admin' || post.author_id === membership?.role) && (
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Study Materials Tab */}
            {activeTab === 'study' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                    {group.current_study ? `Current Study: ${group.current_study}` : 'Study Resources'}
                  </h3>

                  <div className="space-y-4">
                    <a
                      href={group.current_study ? `/dashboard/study-guide?passage=${encodeURIComponent(group.current_study)}` : '/dashboard/study-guide'}
                      className="flex items-center justify-between p-4 bg-rose-50 rounded-lg hover:bg-rose-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-rose-600" />
                        <div>
                          <div className="font-medium text-rose-900">Study Guide</div>
                          <div className="text-sm text-rose-600">Generate a study guide for this passage</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-rose-400" />
                    </a>

                    <a
                      href={group.current_study ? `/dashboard/deep-dive?passage=${encodeURIComponent(group.current_study)}` : '/dashboard/deep-dive'}
                      className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-blue-900">Deep Dive Analysis</div>
                          <div className="text-sm text-blue-600">Word studies, cross-references, context</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-400" />
                    </a>

                    <a
                      href={group.current_study ? `/dashboard/bible-search?q=${encodeURIComponent(group.current_study)}` : '/dashboard/bible-search'}
                      className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-green-900">Read Passage</div>
                          <div className="text-sm text-green-600">Open in Bible Search</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-green-400" />
                    </a>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
                  <h4 className="font-semibold text-amber-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                    Discussion Questions
                  </h4>
                  <ul className="space-y-2 text-amber-800">
                    <li className="flex gap-2">
                      <span className="font-bold">1.</span>
                      What does this passage reveal about God's character?
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">2.</span>
                      What challenges or encourages you in this text?
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">3.</span>
                      How can we apply these truths to our daily lives?
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                    Group Members ({members.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-rose-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
                          {getRoleIcon(member.role)}
                          {getRoleBadge(member.role)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Joined {new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            {membership?.is_member && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-left">
                    <Calendar className="w-5 h-5 text-rose-600" />
                    <span>Schedule Meeting</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-left">
                    <Users className="w-5 h-5 text-rose-600" />
                    <span>Invite Members</span>
                  </button>
                  <button
                    onClick={() => setShowLeaveConfirm(true)}
                    className="w-full flex items-center gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition text-left text-red-700"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Leave Group</span>
                  </button>
                </div>
              </div>
            )}

            {/* Meeting Info */}
            {group.meeting_schedule && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                  Meeting Schedule
                </h3>
                <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-rose-600" />
                  <div>
                    <div className="font-medium text-rose-900">{group.meeting_schedule}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Prayer Requests */}
            {posts.filter((p) => p.category === 'prayer').length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                  Recent Prayer Requests
                </h3>
                <div className="space-y-3">
                  {posts
                    .filter((p) => p.category === 'prayer')
                    .slice(0, 3)
                    .map((prayer) => (
                      <div key={prayer.id} className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-900 line-clamp-2">{prayer.content}</p>
                        <p className="text-xs text-purple-600 mt-1">- {prayer.author}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leave Group Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                Leave Group?
              </h2>
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to leave {group.name}? You can rejoin later if the group is public.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveGroup}
                disabled={leaving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {leaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  'Leave Group'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
