import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// POST - Join a group
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if group exists and is public (or handle private group invites)
    const { data: group, error: groupError } = await supabase
      .from('study_groups')
      .select('id, is_public, name')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    if (!group.is_public) {
      return NextResponse.json(
        { error: 'This is a private group. You need an invitation to join.' },
        { status: 403 }
      );
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('study_group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You are already a member of this group' },
        { status: 400 }
      );
    }

    // Join the group
    const { data: membership, error: joinError } = await supabase
      .from('study_group_members')
      .insert({
        group_id: groupId,
        user_id: user.id,
        role: 'member',
      })
      .select()
      .single();

    if (joinError) throw joinError;

    return NextResponse.json({
      success: true,
      message: `You have joined ${group.name}`,
      membership: {
        role: membership.role,
        joined_at: membership.joined_at,
        is_member: true,
      },
    });
  } catch (error: any) {
    console.error('Join group error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join group' },
      { status: 500 }
    );
  }
}

// DELETE - Leave a group
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check membership
    const { data: membership, error: memberError } = await supabase
      .from('study_group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 400 }
      );
    }

    // If user is the only admin, don't allow leaving
    if (membership.role === 'admin') {
      const { data: adminCount } = await supabase
        .from('study_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('role', 'admin');

      if (adminCount && adminCount.length <= 1) {
        return NextResponse.json(
          { error: 'You are the only admin. Please promote another member to admin before leaving, or delete the group.' },
          { status: 400 }
        );
      }
    }

    // Leave the group
    const { error: leaveError } = await supabase
      .from('study_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id);

    if (leaveError) throw leaveError;

    return NextResponse.json({
      success: true,
      message: 'You have left the group',
    });
  } catch (error: any) {
    console.error('Leave group error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to leave group' },
      { status: 500 }
    );
  }
}

// PATCH - Update member role (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: myMembership } = await supabase
      .from('study_group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (!myMembership || myMembership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can change member roles' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { member_id, role } = body;

    if (!member_id || !role) {
      return NextResponse.json(
        { error: 'member_id and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'leader', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, leader, or member' },
        { status: 400 }
      );
    }

    // Update member role
    const { error: updateError } = await supabase
      .from('study_group_members')
      .update({ role })
      .eq('id', member_id)
      .eq('group_id', groupId);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: `Member role updated to ${role}`,
    });
  } catch (error: any) {
    console.error('Update member role error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update member role' },
      { status: 500 }
    );
  }
}
