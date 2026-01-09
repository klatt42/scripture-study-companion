import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// GET - Get plan details with user progress and all days
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the reading plan
    const { data: plan, error: planError } = await supabase
      .from('reading_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Reading plan not found' },
        { status: 404 }
      );
    }

    // Fetch all days for this plan
    const { data: days, error: daysError } = await supabase
      .from('reading_plan_days')
      .select('*')
      .eq('plan_id', id)
      .order('day_number', { ascending: true });

    if (daysError) throw daysError;

    // Fetch user's progress on this plan
    const { data: progress, error: progressError } = await supabase
      .from('user_reading_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_id', id)
      .single();

    // Not an error if no progress - user may not have started yet
    const userProgress = progress || null;

    return NextResponse.json({
      plan,
      days: days || [],
      progress: userProgress
        ? {
            id: userProgress.id,
            current_day: userProgress.current_day,
            completed_days: userProgress.completed_days || [],
            current_streak: userProgress.current_streak,
            longest_streak: userProgress.longest_streak,
            last_read_date: userProgress.last_read_date,
            started_at: userProgress.started_at,
            completed_at: userProgress.completed_at,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Reading plan fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reading plan' },
      { status: 500 }
    );
  }
}

// PATCH - Update progress (mark day complete/incomplete, update streak)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { day_number, action } = body; // action: 'complete' or 'uncomplete'

    if (!day_number || !action) {
      return NextResponse.json(
        { error: 'day_number and action are required' },
        { status: 400 }
      );
    }

    // Get user's progress for this plan
    const { data: progress, error: fetchError } = await supabase
      .from('user_reading_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_id', planId)
      .single();

    if (fetchError || !progress) {
      return NextResponse.json(
        { error: 'You have not started this reading plan' },
        { status: 400 }
      );
    }

    // Get the plan to check duration
    const { data: plan } = await supabase
      .from('reading_plans')
      .select('duration_days')
      .eq('id', planId)
      .single();

    let completedDays = progress.completed_days || [];
    let currentStreak = progress.current_streak || 0;
    let longestStreak = progress.longest_streak || 0;
    const today = new Date().toISOString().split('T')[0];

    if (action === 'complete') {
      // Add day to completed if not already there
      if (!completedDays.includes(day_number)) {
        completedDays = [...completedDays, day_number].sort((a, b) => a - b);

        // Update streak logic
        const lastReadDate = progress.last_read_date;
        if (lastReadDate) {
          const lastDate = new Date(lastReadDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays <= 1) {
            // Continue streak
            currentStreak += 1;
          } else {
            // Streak broken, start new
            currentStreak = 1;
          }
        } else {
          // First completion
          currentStreak = 1;
        }

        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      }
    } else if (action === 'uncomplete') {
      // Remove day from completed
      completedDays = completedDays.filter((d: number) => d !== day_number);
    }

    // Calculate next current_day (first incomplete day)
    let currentDay = progress.current_day;
    for (let i = 1; i <= (plan?.duration_days || 365); i++) {
      if (!completedDays.includes(i)) {
        currentDay = i;
        break;
      }
    }

    // Check if plan is completed
    const isCompleted = completedDays.length >= (plan?.duration_days || 365);

    // Update progress
    const { data: updated, error: updateError } = await supabase
      .from('user_reading_progress')
      .update({
        completed_days: completedDays,
        current_day: currentDay,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_read_date: action === 'complete' ? today : progress.last_read_date,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', progress.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      progress: {
        id: updated.id,
        current_day: updated.current_day,
        completed_days: updated.completed_days,
        current_streak: updated.current_streak,
        longest_streak: updated.longest_streak,
        last_read_date: updated.last_read_date,
        completed_at: updated.completed_at,
      },
    });
  } catch (error: any) {
    console.error('Update reading progress error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update progress' },
      { status: 500 }
    );
  }
}
