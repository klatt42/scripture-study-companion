import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// GET - List comments for a post
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

    // First verify the post exists and user has access
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select(`
        id,
        group_id,
        study_groups (
          id,
          is_public
        )
      `)
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Type the study_groups relation properly (Supabase returns single object with .single())
    const studyGroup = post.study_groups as unknown as { id: string; is_public: boolean } | null;

    // Check access - must be global post or from a public group or user is member
    if (post.group_id !== null && !studyGroup?.is_public) {
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch comments
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
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (commentsError) throw commentsError;

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
      updated_at: c.updated_at,
      is_own_comment: c.user_id === user.id,
    })) || [];

    return NextResponse.json({
      comments: formattedComments,
      total: formattedComments.length,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch comments';
    console.error('Fetch comments error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST - Create a comment on a post
export async function POST(
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

    // Verify the post exists and check access
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select(`
        id,
        group_id,
        study_groups (
          id,
          is_public
        )
      `)
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Type the study_groups relation properly (Supabase returns single object with .single())
    const studyGroupPost = post.study_groups as unknown as { id: string; is_public: boolean } | null;

    // For group posts, check membership
    if (post.group_id !== null) {
      const { data: membership } = await supabase
        .from('study_group_members')
        .select('id')
        .eq('group_id', post.group_id)
        .eq('user_id', user.id)
        .single();

      // For private groups, must be member. For public groups, anyone can comment
      if (!studyGroupPost?.is_public && !membership) {
        return NextResponse.json(
          { error: 'You must be a member to comment on this post' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Create the comment
    const { data: comment, error: commentError } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
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

    if (commentError) throw commentError;

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        author: comment.profiles?.full_name || comment.profiles?.username || 'Unknown',
        author_id: comment.user_id,
        avatar_url: comment.profiles?.avatar_url,
        created_at: comment.created_at,
        is_own_comment: true,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create comment';
    console.error('Create comment error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Delete a comment (author only)
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

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('comment_id');

    if (!commentId) {
      return NextResponse.json(
        { error: 'comment_id is required' },
        { status: 400 }
      );
    }

    // Fetch the comment to verify ownership and post association
    const { data: comment, error: commentError } = await supabase
      .from('community_comments')
      .select('id, user_id, post_id')
      .eq('id', commentId)
      .eq('post_id', postId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    // Delete the comment
    const { error: deleteError } = await supabase
      .from('community_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Comment deleted',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
    console.error('Delete comment error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
