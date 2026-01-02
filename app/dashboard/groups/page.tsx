'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { Users, Plus, Search, Calendar, BookOpen, MessageCircle, ChevronRight, Globe, Lock } from 'lucide-react';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  member_count: number;
  current_study?: string;
  next_meeting?: string;
  is_public: boolean;
  is_member: boolean;
}

const SAMPLE_GROUPS: StudyGroup[] = [
  {
    id: '1',
    name: 'Sunday Morning Bible Study',
    description: 'Weekly study group exploring the New Testament together.',
    member_count: 12,
    current_study: 'Gospel of John',
    next_meeting: 'Sunday at 9:00 AM',
    is_public: false,
    is_member: true,
  },
  {
    id: '2',
    name: 'Women of Faith',
    description: 'A supportive community for women to study Scripture and grow together.',
    member_count: 8,
    current_study: 'Proverbs 31 Study',
    next_meeting: 'Wednesday at 7:00 PM',
    is_public: true,
    is_member: true,
  },
  {
    id: '3',
    name: 'Young Adults Bible Study',
    description: 'College-age and young professionals studying Scripture together.',
    member_count: 15,
    current_study: 'Book of Romans',
    next_meeting: 'Thursday at 6:30 PM',
    is_public: true,
    is_member: false,
  },
];

export default function GroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>(SAMPLE_GROUPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my-groups' | 'discover'>('my-groups');

  const myGroups = groups.filter((g) => g.is_member);
  const discoverGroups = groups.filter((g) => !g.is_member && g.is_public);

  const filteredGroups = activeTab === 'my-groups' ? myGroups : discoverGroups;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        showBackLink
        pageTitle="Study Groups"
        pageIcon="👥"
        colorScheme="crimson"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)' }}>
              Study Groups
            </h2>
            <p className="text-gray-600">Join or create groups for fellowship and discussion</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors">
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
            Discover
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
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{group.description}</p>

              {group.current_study && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Currently: {group.current_study}</span>
                </div>
              )}

              {group.next_meeting && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{group.next_meeting}</span>
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
                <button className="w-full py-2 px-4 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors">
                  Request to Join
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
            <button className="px-6 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors">
              Create New Group
            </button>
          </div>
        )}

        {/* Features Coming Soon */}
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
    </div>
  );
}
