import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - List all memory verses for user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: verses, error } = await supabase
      .from('memory_verses')
      .select('*')
      .eq('user_id', user.id)
      .order('next_review', { ascending: true });

    if (error) throw error;

    // Calculate due verses
    const now = new Date();
    const dueVerses = verses?.filter(v => new Date(v.next_review) <= now) || [];

    return NextResponse.json({
      verses: verses || [],
      dueCount: dueVerses.length,
      stats: {
        total: verses?.length || 0,
        mastered: verses?.filter(v => v.repetitions >= 10).length || 0,
        learning: verses?.filter(v => v.repetitions > 0 && v.repetitions < 10).length || 0,
        new: verses?.filter(v => v.repetitions === 0).length || 0,
      },
    });
  } catch (error: any) {
    console.error('Memory verses fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch memory verses' },
      { status: 500 }
    );
  }
}

// POST - Add new verse to memorize
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reference, text, translation = 'NIV' } = body;

    if (!reference || !text) {
      return NextResponse.json(
        { error: 'Reference and text are required' },
        { status: 400 }
      );
    }

    // Check if verse already exists
    const { data: existing } = await supabase
      .from('memory_verses')
      .select('id')
      .eq('user_id', user.id)
      .eq('reference', reference)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This verse is already in your memory list' },
        { status: 400 }
      );
    }

    const { data: verse, error } = await supabase
      .from('memory_verses')
      .insert({
        user_id: user.id,
        reference,
        text,
        translation,
        ease_factor: 2.5, // Default SM-2 ease factor
        interval: 0,
        repetitions: 0,
        next_review: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ verse });
  } catch (error: any) {
    console.error('Memory verse add error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add memory verse' },
      { status: 500 }
    );
  }
}

// PATCH - Update verse after review (SM-2 algorithm)
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, quality } = body; // quality: 0-5 (SM-2 rating)

    if (!id || quality === undefined || quality < 0 || quality > 5) {
      return NextResponse.json(
        { error: 'Valid id and quality (0-5) are required' },
        { status: 400 }
      );
    }

    // Get current verse data
    const { data: verse, error: fetchError } = await supabase
      .from('memory_verses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !verse) {
      return NextResponse.json(
        { error: 'Verse not found' },
        { status: 404 }
      );
    }

    // SM-2 Algorithm
    let { repetitions, ease_factor, interval } = verse;

    if (quality >= 3) {
      // Correct response
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * ease_factor);
      }
      repetitions += 1;
    } else {
      // Incorrect - reset
      repetitions = 0;
      interval = 1;
    }

    // Update ease factor
    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (ease_factor < 1.3) ease_factor = 1.3;

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    // Update in database
    const { data: updated, error: updateError } = await supabase
      .from('memory_verses')
      .update({
        repetitions,
        ease_factor,
        interval,
        next_review: nextReview.toISOString(),
        last_reviewed: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      verse: updated,
      nextReview: nextReview.toISOString(),
      interval,
    });
  } catch (error: any) {
    console.error('Memory verse review error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update memory verse' },
      { status: 500 }
    );
  }
}

// DELETE - Remove verse from memory list
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Verse id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('memory_verses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Memory verse delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete memory verse' },
      { status: 500 }
    );
  }
}
