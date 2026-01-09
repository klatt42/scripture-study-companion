/**
 * End-to-End Test Script for Scripture Study Companion
 * Tests all API endpoints and database integrations
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const BASE_URL = 'http://localhost:3318';

// Test credentials
const TEST_EMAIL = 'klatt42@gmail.com';
const TEST_PASSWORD = 'Scripture2025!';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

async function log(name: string, passed: boolean, error?: string, details?: string) {
  results.push({ name, passed, error, details });
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}${error ? `: ${error}` : ''}${details ? ` (${details})` : ''}`);
}

async function authenticatedFetch(url: string, accessToken: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `sb-fntcasdassvplgcabdty-auth-token=${accessToken}`,
      ...options.headers,
    },
  });
}

async function runTests() {
  console.log('\n========================================');
  console.log('Scripture Study Companion - E2E Tests');
  console.log('========================================\n');

  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Test Authentication
  console.log('--- AUTHENTICATION ---');

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (authError || !authData.session) {
    await log('Login', false, authError?.message || 'No session returned');
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }

  await log('Login', true, undefined, `User: ${authData.user?.email}`);
  const accessToken = authData.session.access_token;

  // 2. Test Page Loads
  console.log('\n--- PAGE LOADS ---');

  const pages = [
    { path: '/', name: 'Landing Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/signup', name: 'Signup Page' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/dashboard/reading-plans', name: 'Reading Plans' },
    { path: '/dashboard/groups', name: 'Groups' },
    { path: '/dashboard/community', name: 'Community' },
    { path: '/dashboard/sessions', name: 'Sessions' },
    { path: '/dashboard/deep-dive', name: 'Deep Dive' },
    { path: '/dashboard/memory', name: 'Memory Verses' },
    { path: '/dashboard/my-guides', name: 'My Guides' },
    { path: '/dashboard/notes', name: 'Notes' },
    { path: '/dashboard/calendar', name: 'Calendar' },
    { path: '/dashboard/settings', name: 'Settings' },
  ];

  for (const page of pages) {
    try {
      const res = await fetch(`${BASE_URL}${page.path}`);
      await log(page.name, res.status === 200, res.status !== 200 ? `Status: ${res.status}` : undefined);
    } catch (e) {
      await log(page.name, false, String(e));
    }
  }

  // 3. Test Sessions API
  console.log('\n--- SESSIONS API ---');

  // GET Sessions (should be empty or have existing)
  try {
    const res = await supabase.from('study_sessions').select('*').limit(5);
    await log('GET Sessions', !res.error, res.error?.message, `Found ${res.data?.length || 0} sessions`);
  } catch (e) {
    await log('GET Sessions', false, String(e));
  }

  // POST Create Session
  let createdSessionId: string | null = null;
  try {
    const { data, error } = await supabase.from('study_sessions').insert({
      user_id: authData.user!.id,
      duration_minutes: 15,
      passage: 'John 3:16',
      notes: 'E2E Test Session',
      session_type: 'study',
      session_date: new Date().toISOString().split('T')[0],
    }).select().single();

    if (error) throw error;
    createdSessionId = data.id;
    await log('POST Create Session', true, undefined, `ID: ${data.id}`);
  } catch (e) {
    await log('POST Create Session', false, String(e));
  }

  // GET Stats
  try {
    const res = await supabase.from('study_sessions')
      .select('session_date, duration_minutes')
      .eq('user_id', authData.user!.id);

    const totalSessions = res.data?.length || 0;
    const totalMinutes = res.data?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0;
    await log('GET Stats', !res.error, res.error?.message, `${totalSessions} sessions, ${totalMinutes} mins`);
  } catch (e) {
    await log('GET Stats', false, String(e));
  }

  // DELETE Session
  if (createdSessionId) {
    try {
      const { error } = await supabase.from('study_sessions')
        .delete()
        .eq('id', createdSessionId);
      await log('DELETE Session', !error, error?.message);
    } catch (e) {
      await log('DELETE Session', false, String(e));
    }
  }

  // 4. Test Reading Plans API
  console.log('\n--- READING PLANS API ---');

  // GET Reading Plans
  try {
    const res = await supabase.from('reading_plans').select('*');
    await log('GET Reading Plans', !res.error, res.error?.message, `Found ${res.data?.length || 0} plans`);
  } catch (e) {
    await log('GET Reading Plans', false, String(e));
  }

  // Check for user progress
  try {
    const res = await supabase.from('user_reading_progress')
      .select('*, reading_plans(*)')
      .eq('user_id', authData.user!.id);
    await log('GET User Progress', !res.error, res.error?.message, `${res.data?.length || 0} active plans`);
  } catch (e) {
    await log('GET User Progress', false, String(e));
  }

  // 5. Test Groups API
  console.log('\n--- GROUPS API ---');

  // GET Groups
  try {
    const res = await supabase.from('study_groups').select('*');
    await log('GET Groups', !res.error, res.error?.message, `Found ${res.data?.length || 0} groups`);
  } catch (e) {
    await log('GET Groups', false, String(e));
  }

  // POST Create Group
  let createdGroupId: string | null = null;
  try {
    const { data, error } = await supabase.from('study_groups').insert({
      name: 'E2E Test Group',
      description: 'Testing group creation',
      created_by: authData.user!.id,
      is_public: true,
    }).select().single();

    if (error) throw error;
    createdGroupId = data.id;
    await log('POST Create Group', true, undefined, `ID: ${data.id}`);

    // Add creator as admin member
    await supabase.from('study_group_members').insert({
      group_id: data.id,
      user_id: authData.user!.id,
      role: 'admin',
    });
  } catch (e) {
    await log('POST Create Group', false, String(e));
  }

  // GET Group Members
  if (createdGroupId) {
    try {
      const res = await supabase.from('study_group_members')
        .select('*, profiles(*)')
        .eq('group_id', createdGroupId);
      await log('GET Group Members', !res.error, res.error?.message, `${res.data?.length || 0} members`);
    } catch (e) {
      await log('GET Group Members', false, String(e));
    }
  }

  // DELETE Group
  if (createdGroupId) {
    try {
      // Delete members first
      await supabase.from('study_group_members').delete().eq('group_id', createdGroupId);
      // Then delete group
      const { error } = await supabase.from('study_groups').delete().eq('id', createdGroupId);
      await log('DELETE Group', !error, error?.message);
    } catch (e) {
      await log('DELETE Group', false, String(e));
    }
  }

  // 6. Test Community API
  console.log('\n--- COMMUNITY API ---');

  // GET Community Posts
  try {
    const res = await supabase.from('community_posts').select('*').is('group_id', null);
    await log('GET Community Posts', !res.error, res.error?.message, `Found ${res.data?.length || 0} posts`);
  } catch (e) {
    await log('GET Community Posts', false, String(e));
  }

  // POST Create Community Post
  let createdPostId: string | null = null;
  try {
    const { data, error } = await supabase.from('community_posts').insert({
      title: 'E2E Test Post',
      content: 'This is a test post for E2E testing',
      category: 'discussion',
      user_id: authData.user!.id,
      group_id: null, // Global post
    }).select().single();

    if (error) throw error;
    createdPostId = data.id;
    await log('POST Create Post', true, undefined, `ID: ${data.id}`);
  } catch (e) {
    await log('POST Create Post', false, String(e));
  }

  // POST Create Comment
  let createdCommentId: string | null = null;
  if (createdPostId) {
    try {
      const { data, error } = await supabase.from('community_comments').insert({
        post_id: createdPostId,
        user_id: authData.user!.id,
        content: 'E2E Test Comment',
      }).select().single();

      if (error) throw error;
      createdCommentId = data.id;
      await log('POST Create Comment', true, undefined, `ID: ${data.id}`);
    } catch (e) {
      await log('POST Create Comment', false, String(e));
    }
  }

  // DELETE Comment
  if (createdCommentId) {
    try {
      const { error } = await supabase.from('community_comments').delete().eq('id', createdCommentId);
      await log('DELETE Comment', !error, error?.message);
    } catch (e) {
      await log('DELETE Comment', false, String(e));
    }
  }

  // DELETE Post
  if (createdPostId) {
    try {
      const { error } = await supabase.from('community_posts').delete().eq('id', createdPostId);
      await log('DELETE Post', !error, error?.message);
    } catch (e) {
      await log('DELETE Post', false, String(e));
    }
  }

  // 7. Test Memory Verses API
  console.log('\n--- MEMORY VERSES API ---');

  // GET Memory Verses
  try {
    const res = await supabase.from('memory_verses')
      .select('*')
      .eq('user_id', authData.user!.id);
    await log('GET Memory Verses', !res.error, res.error?.message, `Found ${res.data?.length || 0} verses`);
  } catch (e) {
    await log('GET Memory Verses', false, String(e));
  }

  // POST Create Memory Verse
  let createdVerseId: string | null = null;
  try {
    const { data, error } = await supabase.from('memory_verses').insert({
      user_id: authData.user!.id,
      reference: 'Psalm 23:1',
      verse_text: 'The Lord is my shepherd; I shall not want.',
      translation: 'KJV',
    }).select().single();

    if (error) throw error;
    createdVerseId = data.id;
    await log('POST Create Verse', true, undefined, `ID: ${data.id}`);
  } catch (e) {
    await log('POST Create Verse', false, String(e));
  }

  // DELETE Verse
  if (createdVerseId) {
    try {
      const { error } = await supabase.from('memory_verses').delete().eq('id', createdVerseId);
      await log('DELETE Verse', !error, error?.message);
    } catch (e) {
      await log('DELETE Verse', false, String(e));
    }
  }

  // 8. Test Study Guides API
  console.log('\n--- STUDY GUIDES API ---');

  // GET Study Guides
  try {
    const res = await supabase.from('study_guides')
      .select('*')
      .eq('user_id', authData.user!.id);
    await log('GET Study Guides', !res.error, res.error?.message, `Found ${res.data?.length || 0} guides`);
  } catch (e) {
    await log('GET Study Guides', false, String(e));
  }

  // 9. Test Notes API
  console.log('\n--- NOTES API ---');

  // GET Notes
  try {
    const res = await supabase.from('notes')
      .select('*')
      .eq('user_id', authData.user!.id);
    await log('GET Notes', !res.error, res.error?.message, `Found ${res.data?.length || 0} notes`);
  } catch (e) {
    await log('GET Notes', false, String(e));
  }

  // 10. Test Calendar Events API
  console.log('\n--- CALENDAR API ---');

  // GET Calendar Events
  try {
    const res = await supabase.from('calendar_events')
      .select('*')
      .eq('user_id', authData.user!.id);
    await log('GET Calendar Events', !res.error, res.error?.message, `Found ${res.data?.length || 0} events`);
  } catch (e) {
    await log('GET Calendar Events', false, String(e));
  }

  // Summary
  console.log('\n========================================');
  console.log('TEST SUMMARY');
  console.log('========================================');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }

  console.log('\n========================================\n');

  // Sign out
  await supabase.auth.signOut();

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(console.error);
