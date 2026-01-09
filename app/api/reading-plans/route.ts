import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// GET - List all available reading plans + user's active plans with progress
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all public reading plans
    const { data: plans, error: plansError } = await supabase
      .from('reading_plans')
      .select('*')
      .eq('is_public', true)
      .order('duration_days', { ascending: true });

    if (plansError) throw plansError;

    // Fetch user's active plans with progress
    const { data: userProgress, error: progressError } = await supabase
      .from('user_reading_progress')
      .select(`
        *,
        reading_plans (*)
      `)
      .eq('user_id', user.id);

    if (progressError) throw progressError;

    // Map active plans with progress info
    const activePlans = userProgress?.map((progress) => ({
      ...progress.reading_plans,
      progress: {
        id: progress.id,
        current_day: progress.current_day,
        completed_days: progress.completed_days || [],
        current_streak: progress.current_streak,
        longest_streak: progress.longest_streak,
        last_read_date: progress.last_read_date,
        started_at: progress.started_at,
        completed_at: progress.completed_at,
        percentage: Math.round(
          ((progress.completed_days?.length || 0) / (progress.reading_plans?.duration_days || 1)) * 100
        ),
      },
    })) || [];

    // Mark which plans are active for the user
    const activePlanIds = activePlans.map((p) => p.id);
    const availablePlans = plans?.map((plan) => ({
      ...plan,
      is_active: activePlanIds.includes(plan.id),
    })) || [];

    return NextResponse.json({
      plans: availablePlans,
      activePlans,
    });
  } catch (error: any) {
    console.error('Reading plans fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reading plans' },
      { status: 500 }
    );
  }
}

// POST - Start a new reading plan
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan_id } = body;

    if (!plan_id) {
      return NextResponse.json(
        { error: 'plan_id is required' },
        { status: 400 }
      );
    }

    // Check if plan exists
    const { data: plan, error: planError } = await supabase
      .from('reading_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Reading plan not found' },
        { status: 404 }
      );
    }

    // Check if user already has this plan active
    const { data: existing } = await supabase
      .from('user_reading_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('plan_id', plan_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You already have this reading plan active' },
        { status: 400 }
      );
    }

    // Create new progress entry
    const { data: progress, error: insertError } = await supabase
      .from('user_reading_progress')
      .insert({
        user_id: user.id,
        plan_id,
        current_day: 1,
        completed_days: [],
        current_streak: 0,
        longest_streak: 0,
        last_read_date: null,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      progress,
      plan,
    });
  } catch (error: any) {
    console.error('Start reading plan error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start reading plan' },
      { status: 500 }
    );
  }
}

// DELETE - Stop/remove a reading plan
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const plan_id = searchParams.get('plan_id');

    if (!plan_id) {
      return NextResponse.json(
        { error: 'plan_id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_reading_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('plan_id', plan_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Stop reading plan error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to stop reading plan' },
      { status: 500 }
    );
  }
}
