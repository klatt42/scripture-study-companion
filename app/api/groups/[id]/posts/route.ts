import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// GET - List posts for a group
export async function GET(
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

    // Check if user can access this group
    const { data: group } = await supabase
      .from('study_groups')
      .select('id, is_public')
      .eq('id', groupId)
      .single();

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check membership for private groups
    if (!group.is_public) {
      const { data: membership } = await supabase
        .from('study_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (!membership) {
        return NextResponse.json(
          { error: 'You must be a member to view posts in this private group' },
          { status: 403 }
        );
      }
    }

    // Parse query params for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch posts
    let postsQuery = supabase
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
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      postsQuery = postsQuery.eq('category', category);
    }

    const { data: posts, error: postsError } = await postsQuery;

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

    // Format posts
    const formattedPosts = posts?.map((p: any) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      category: p.category,
      author: p.profiles?.full_name || p.profiles?.username || 'Unknown',
      author_id: p.user_id,
      avatar_url: p.profiles?.avatar_url,
      created_at: p.created_at,
      updated_at: p.updated_at,
      comment_count: commentCounts[p.id] || 0,
    })) || [];

    return NextResponse.json({
      posts: formattedPosts,
      total: formattedPosts.length,
    });
  } catch (error: any) {
    console.error('Fetch group posts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST - Create a new post in a group
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

    // Check if user is a member
    const { data: membership } = await supabase
      .from('study_group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be a member to post in this group' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, category = 'discussion' } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const validCategories = ['discussion', 'question', 'prayer', 'resource', 'testimony'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Create the post
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .insert({
        group_id: groupId,
        user_id: user.id,
        title,
        content,
        category,
      })
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (postError) throw postError;

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category,
        author: post.profiles?.full_name || post.profiles?.username || 'Unknown',
        author_id: post.user_id,
        avatar_url: post.profiles?.avatar_url,
        created_at: post.created_at,
        comment_count: 0,
      },
    });
  } catch (error: any) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a post (author or admin only)
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

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');

    if (!postId) {
      return NextResponse.json(
        { error: 'post_id is required' },
        { status: 400 }
      );
    }

    // Fetch the post to check ownership
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select('id, user_id')
      .eq('id', postId)
      .eq('group_id', groupId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user is the author or a group admin
    const isAuthor = post.user_id === user.id;

    if (!isAuthor) {
      const { data: membership } = await supabase
        .from('study_group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (!membership || membership.role !== 'admin') {
        return NextResponse.json(
          { error: 'Only the author or group admins can delete posts' },
          { status: 403 }
        );
      }
    }

    // Delete comments first (if not using cascade)
    await supabase
      .from('community_comments')
      .delete()
      .eq('post_id', postId);

    // Delete the post
    const { error: deleteError } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Post deleted',
    });
  } catch (error: any) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete post' },
      { status: 500 }
    );
  }
}
