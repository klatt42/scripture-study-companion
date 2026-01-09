import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// GET - List all groups (user's groups + public groups)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Fetch groups the user is a member of
    const { data: memberships, error: membershipError } = await supabase
      .from('study_group_members')
      .select(`
        role,
        joined_at,
        study_groups (*)
      `)
      .eq('user_id', user.id);

    if (membershipError) throw membershipError;

    // Get member counts for user's groups
    const myGroupIds = memberships?.map((m: any) => m.study_groups?.id).filter(Boolean) || [];

    // Fetch public groups for discovery (excluding ones user is already in)
    let publicGroupsQuery = supabase
      .from('study_groups')
      .select('*')
      .eq('is_public', true);

    if (myGroupIds.length > 0) {
      publicGroupsQuery = publicGroupsQuery.not('id', 'in', `(${myGroupIds.join(',')})`);
    }

    if (search) {
      publicGroupsQuery = publicGroupsQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: publicGroups, error: publicError } = await publicGroupsQuery;

    if (publicError) throw publicError;

    // Get member counts for all groups
    const allGroupIds = [...myGroupIds, ...(publicGroups?.map(g => g.id) || [])];

    const { data: memberCounts, error: countError } = await supabase
      .from('study_group_members')
      .select('group_id')
      .in('group_id', allGroupIds);

    if (countError) throw countError;

    // Count members per group
    const countMap: Record<string, number> = {};
    memberCounts?.forEach((m: any) => {
      countMap[m.group_id] = (countMap[m.group_id] || 0) + 1;
    });

    // Format user's groups
    const myGroups = memberships?.map((m: any) => ({
      ...m.study_groups,
      member_count: countMap[m.study_groups?.id] || 0,
      is_member: true,
      user_role: m.role,
      joined_at: m.joined_at,
    })).filter((g: any) => g.id) || [];

    // Format public groups
    const discoverGroups = publicGroups?.map((g) => ({
      ...g,
      member_count: countMap[g.id] || 0,
      is_member: false,
    })) || [];

    return NextResponse.json({
      myGroups,
      discoverGroups,
    });
  } catch (error: any) {
    console.error('Groups fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

// POST - Create a new group
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, is_public = false, current_study, meeting_schedule } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('study_groups')
      .insert({
        name,
        description,
        is_public,
        current_study,
        meeting_schedule,
        created_by: user.id,
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('study_group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'admin',
      });

    if (memberError) throw memberError;

    return NextResponse.json({
      success: true,
      group: {
        ...group,
        member_count: 1,
        is_member: true,
        user_role: 'admin',
      },
    });
  } catch (error: any) {
    console.error('Create group error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create group' },
      { status: 500 }
    );
  }
}
