import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// GET - Get user's study session statistics
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all sessions for the user (we need them to calculate streak)
    const { data: allSessions, error: allError } = await supabase
      .from('study_sessions')
      .select('session_date, duration_minutes')
      .eq('user_id', user.id)
      .order('session_date', { ascending: false });

    if (allError) throw allError;

    // Calculate total sessions and minutes
    const totalSessions = allSessions?.length || 0;
    const totalMinutes = allSessions?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0;

    // Calculate current streak (consecutive days from today or yesterday)
    const currentStreak = calculateStreak(allSessions || []);

    // Calculate weekly progress (last 7 days)
    const weeklyProgress = calculateWeeklyProgress(allSessions || []);

    // Get weekly goal from user settings (default to 120 minutes if not set)
    const { data: settings } = await supabase
      .from('user_settings')
      .select('weekly_study_goal')
      .eq('user_id', user.id)
      .single();

    const weeklyGoal = settings?.weekly_study_goal || 120;

    // Get breakdown by type for the week
    const { data: weekSessions, error: weekError } = await supabase
      .from('study_sessions')
      .select('session_type, duration_minutes')
      .eq('user_id', user.id)
      .gte('session_date', getDateNDaysAgo(7));

    if (weekError) throw weekError;

    const typeBreakdown = {
      reading: 0,
      study: 0,
      memory: 0,
      prayer: 0,
    };

    weekSessions?.forEach(s => {
      const type = s.session_type as keyof typeof typeBreakdown;
      if (type in typeBreakdown) {
        typeBreakdown[type] += s.duration_minutes;
      }
    });

    return NextResponse.json({
      totalSessions,
      totalMinutes,
      currentStreak,
      weeklyGoal,
      weeklyProgress,
      typeBreakdown,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stats';
    console.error('Fetch stats error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Calculate streak of consecutive days with study sessions
function calculateStreak(sessions: { session_date: string }[]): number {
  if (sessions.length === 0) return 0;

  // Get unique dates, sorted descending
  const uniqueDates = [...new Set(sessions.map(s => s.session_date))].sort().reverse();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Streak must start from today or yesterday
  const mostRecentDate = uniqueDates[0];
  if (mostRecentDate !== todayStr && mostRecentDate !== yesterdayStr) {
    return 0; // Streak broken
  }

  // Count consecutive days
  let streak = 0;
  const checkDate = mostRecentDate === todayStr ? today : yesterday;

  for (const dateStr of uniqueDates) {
    const expectedStr = checkDate.toISOString().split('T')[0];

    if (dateStr === expectedStr) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr < expectedStr) {
      // Gap found, streak ends
      break;
    }
  }

  return streak;
}

// Calculate total minutes in the last 7 days
function calculateWeeklyProgress(sessions: { session_date: string; duration_minutes: number }[]): number {
  const sevenDaysAgo = getDateNDaysAgo(7);

  return sessions
    .filter(s => s.session_date >= sevenDaysAgo)
    .reduce((acc, s) => acc + s.duration_minutes, 0);
}

// Get date N days ago in YYYY-MM-DD format
function getDateNDaysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split('T')[0];
}
