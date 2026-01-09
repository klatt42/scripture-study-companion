'use client';

import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { Users, Plus, Search, Calendar, BookOpen, MessageCircle, ChevronRight, Globe, Lock, Loader2, AlertCircle, X } from 'lucide-react';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  member_count: number;
  current_study?: string;
  meeting_schedule?: string;
  is_public: boolean;
  is_member: boolean;
  user_role?: string;
}

export default function GroupsPage() {
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<StudyGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my-groups' | 'discover'>('my-groups');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  // Create group form state
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    is_public: true,
    current_study: '',
    meeting_schedule: '',
  });
  const [creating, setCreating] = useState(false);

  // Fetch groups from API
  const fetchGroups = async (search?: string) => {
    try {
      setError(null);
      const url = search ? `/api/groups?search=${encodeURIComponent(search)}` : '/api/groups';
      const response = await fetch(url);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch groups');
      }

      const data = await response.json();
      setMyGroups(data.myGroups || []);
      setDiscoverGroups(data.discoverGroups || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'discover') {
        fetchGroups(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  // Create a new group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create group');
      }

      const data = await response.json();
      setMyGroups((prev) => [data.group, ...prev]);
      setShowCreateModal(false);
      setNewGroup({
        name: '',
        description: '',
        is_public: true,
        current_study: '',
        meeting_schedule: '',
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Join a public group
  const handleJoinGroup = async (groupId: string) => {
    setJoiningGroupId(groupId);
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join group');
      }

      // Move group from discover to my groups
      const joinedGroup = discoverGroups.find((g) => g.id === groupId);
      if (joinedGroup) {
        setDiscoverGroups((prev) => prev.filter((g) => g.id !== groupId));
        setMyGroups((prev) => [...prev, { ...joinedGroup, is_member: true, user_role: 'member' }]);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setJoiningGroupId(null);
    }
  };

  const filteredGroups = activeTab === 'my-groups' ? myGroups : discoverGroups;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          showBackLink
          pageTitle="Study Groups"
          pageIcon="👥"
          colorScheme="crimson"
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
          <span className="ml-2 text-gray-600">Loading groups...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        showBackLink
        pageTitle="Study Groups"
        pageIcon="👥"
        colorScheme="crimson"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => fetchGroups()}
              className="ml-auto text-red-600 hover:text-red-700 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Header with Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
              Study Groups
            </h2>
            <p className="text-gray-600">Join or create groups for fellowship and discussion</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('my-groups')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'my-groups'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            My Groups ({myGroups.length})
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'discover'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Discover ({discoverGroups.length})
          </button>
        </div>

        {/* Search (for Discover tab) */}
        {activeTab === 'discover' && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all"
              />
            </div>
          </div>
        )}

        {/* Groups Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-rose-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      {group.is_public ? (
                        <>
                          <Globe className="w-3 h-3" />
                          <span>Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>Private</span>
                        </>
                      )}
                      <span className="mx-1">•</span>
                      <span>{group.member_count} members</span>
                      {group.user_role && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="capitalize text-rose-600">{group.user_role}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description || 'No description'}</p>

              {group.current_study && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Currently: {group.current_study}</span>
                </div>
              )}

              {group.meeting_schedule && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{group.meeting_schedule}</span>
                </div>
              )}

              {group.is_member ? (
                <a
                  href={`/dashboard/groups/${group.id}`}
                  className="flex items-center justify-between w-full py-2 px-4 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  <span className="font-medium">Open Group</span>
                  <ChevronRight className="w-5 h-5" />
                </a>
              ) : (
                <button
                  onClick={() => handleJoinGroup(group.id)}
                  disabled={joiningGroupId === group.id}
                  className="w-full py-2 px-4 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {joiningGroupId === group.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Group'
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              {activeTab === 'my-groups' ? 'No Groups Yet' : 'No Groups Found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'my-groups'
                ? 'Create a new group or join an existing one to study together.'
                : 'Try adjusting your search or create your own group.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
            >
              Create New Group
            </button>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-8 p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200">
          <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Group Features
          </h3>
          <ul className="text-gray-600 space-y-2">
            <li className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-rose-500" />
              Group discussions and prayer requests
            </li>
            <li className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-500" />
              Shared reading plans and study guides
            </li>
            <li className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              Meeting scheduling with reminders
            </li>
          </ul>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                  Create Study Group
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="e.g., Sunday Morning Bible Study"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Tell others what this group is about..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Study (optional)
                  </label>
                  <input
                    type="text"
                    value={newGroup.current_study}
                    onChange={(e) => setNewGroup({ ...newGroup, current_study: e.target.value })}
                    placeholder="e.g., Gospel of John"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Schedule (optional)
                  </label>
                  <input
                    type="text"
                    value={newGroup.meeting_schedule}
                    onChange={(e) => setNewGroup({ ...newGroup, meeting_schedule: e.target.value })}
                    placeholder="e.g., Sundays at 9:00 AM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newGroup.is_public}
                      onChange={(e) => setNewGroup({ ...newGroup, is_public: e.target.checked })}
                      className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                    />
                    <span className="text-sm text-gray-700">
                      Make this group public (anyone can join)
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newGroup.name.trim()}
                    className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Group'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
