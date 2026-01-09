import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// GET - Get post details with comments
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the post
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          avatar_url
        ),
        study_groups (
          id,
          name,
          is_public
        )
      `)
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check access - must be global post or from a public group
    if (post.group_id !== null && !post.study_groups?.is_public) {
      // Check if user is a member of the private group
      const { data: membership } = await supabase
        .from('study_group_members')
        .select('id')
        .eq('group_id', post.group_id)
        .eq('user_id', user.id)
        .single();

      if (!membership) {
        return NextResponse.json(
          { error: 'You do not have access to this post' },
          { status: 403 }
        );
      }
    }

    // Fetch comments for this post
    const { data: comments, error: commentsError } = await supabase
      .from('community_comments')
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;

    // Format the post
    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      author: post.profiles?.full_name || post.profiles?.username || 'Unknown',
      author_id: post.user_id,
      avatar_url: post.profiles?.avatar_url,
      created_at: post.created_at,
      updated_at: post.updated_at,
      is_own_post: post.user_id === user.id,
      group_name: post.study_groups?.name || null,
      group_id: post.group_id,
    };

    // Format comments
    const formattedComments = comments?.map((c: {
      id: string;
      content: string;
      user_id: string;
      created_at: string;
      updated_at: string;
      profiles?: { id: string; username?: string; full_name?: string; avatar_url?: string } | null;
    }) => ({
      id: c.id,
      content: c.content,
      author: c.profiles?.full_name || c.profiles?.username || 'Unknown',
      author_id: c.user_id,
      avatar_url: c.profiles?.avatar_url,
      created_at: c.created_at,
      is_own_comment: c.user_id === user.id,
    })) || [];

    return NextResponse.json({
      post: formattedPost,
      comments: formattedComments,
      comment_count: formattedComments.length,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch post';
    console.error('Fetch post error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PATCH - Update a post (author only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select('id, user_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own posts' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, category } = body;

    const updates: Record<string, string> = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (category !== undefined) {
      const validCategories = ['discussion', 'question', 'prayer', 'resource', 'testimony'];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }
      updates.category = category;
    }

    const { data: updatedPost, error: updateError } = await supabase
      .from('community_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      post: updatedPost,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update post';
    console.error('Update post error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Delete a post (author only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select('id, user_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    // Delete comments first
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
    console.error('Delete post error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
