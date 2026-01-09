import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// GET - Get group details with members and posts
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

    // Fetch the group
    const { data: group, error: groupError } = await supabase
      .from('study_groups')
      .select('*')
      .eq('id', id)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if user is a member
    const { data: membership } = await supabase
      .from('study_group_members')
      .select('role, joined_at')
      .eq('group_id', id)
      .eq('user_id', user.id)
      .single();

    // If group is private and user is not a member, deny access
    if (!group.is_public && !membership) {
      return NextResponse.json(
        { error: 'You are not a member of this private group' },
        { status: 403 }
      );
    }

    // Fetch members with profile info
    const { data: members, error: membersError } = await supabase
      .from('study_group_members')
      .select(`
        id,
        role,
        joined_at,
        user_id,
        profiles (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('group_id', id)
      .order('role', { ascending: true })
      .order('joined_at', { ascending: true });

    if (membersError) throw membersError;

    // Fetch posts/discussions for this group
    const { data: posts, error: postsError } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('group_id', id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (postsError) throw postsError;

    // Get comment counts for posts
    const postIds = posts?.map(p => p.id) || [];
    const commentCounts: Record<string, number> = {};

    if (postIds.length > 0) {
      const { data: comments } = await supabase
        .from('community_comments')
        .select('post_id')
        .in('post_id', postIds);

      comments?.forEach((c: any) => {
        commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
      });
    }

    // Format members
    const formattedMembers = members?.map((m: any) => ({
      id: m.id,
      user_id: m.user_id,
      name: m.profiles?.full_name || m.profiles?.username || 'Unknown',
      role: m.role,
      joined_at: m.joined_at,
      avatar_url: m.profiles?.avatar_url,
    })) || [];

    // Format posts
    const formattedPosts = posts?.map((p: any) => ({
      id: p.id,
      author: p.profiles?.full_name || p.profiles?.username || 'Unknown',
      author_id: p.user_id,
      title: p.title,
      content: p.content,
      category: p.category,
      created_at: p.created_at,
      replies: commentCounts[p.id] || 0,
    })) || [];

    return NextResponse.json({
      group: {
        ...group,
        member_count: formattedMembers.length,
      },
      members: formattedMembers,
      posts: formattedPosts,
      membership: membership ? {
        role: membership.role,
        joined_at: membership.joined_at,
        is_member: true,
      } : {
        is_member: false,
      },
    });
  } catch (error: any) {
    console.error('Group fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

// PATCH - Update group info (admin/leader only)
export async function PATCH(
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

    // Check if user is admin or leader
    const { data: membership } = await supabase
      .from('study_group_members')
      .select('role')
      .eq('group_id', id)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['admin', 'leader'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only admins and leaders can update the group' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, is_public, current_study, meeting_schedule } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (is_public !== undefined) updates.is_public = is_public;
    if (current_study !== undefined) updates.current_study = current_study;
    if (meeting_schedule !== undefined) updates.meeting_schedule = meeting_schedule;

    const { data: group, error } = await supabase
      .from('study_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, group });
  } catch (error: any) {
    console.error('Update group error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update group' },
      { status: 500 }
    );
  }
}

// DELETE - Delete group (admin only)
export async function DELETE(
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

    // Check if user is admin
    const { data: membership } = await supabase
      .from('study_group_members')
      .select('role')
      .eq('group_id', id)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete the group' },
        { status: 403 }
      );
    }

    // Delete group (cascade will handle members and posts)
    const { error } = await supabase
      .from('study_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete group error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete group' },
      { status: 500 }
    );
  }
}
