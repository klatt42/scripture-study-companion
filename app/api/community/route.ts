import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// GET - List community posts (global posts + posts from public groups)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch global posts (group_id is null) and posts from public groups
    let postsQuery = supabase
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
      .or('group_id.is.null,study_groups.is_public.eq.true')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') {
      postsQuery = postsQuery.eq('category', category);
    }

    const { data: posts, error: postsError } = await postsQuery;

    if (postsError) {
      // If the OR query fails, try a simpler approach - just get posts where group_id is null
      const { data: globalPosts, error: globalError } = await supabase
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
        .is('group_id', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (globalError) throw globalError;

      // Get comment counts
      const postIds = globalPosts?.map(p => p.id) || [];
      const commentCounts = await getCommentCounts(supabase, postIds);

      const formattedPosts = formatPosts(globalPosts || [], commentCounts, user.id);

      return NextResponse.json({
        posts: formattedPosts,
        total: formattedPosts.length,
      });
    }

    // Filter out posts from private groups (in case OR didn't work perfectly)
    const filteredPosts = posts?.filter(p =>
      p.group_id === null || p.study_groups?.is_public === true
    ) || [];

    // Get comment counts
    const postIds = filteredPosts.map(p => p.id);
    const commentCounts = await getCommentCounts(supabase, postIds);

    const formattedPosts = formatPosts(filteredPosts, commentCounts, user.id);

    return NextResponse.json({
      posts: formattedPosts,
      total: formattedPosts.length,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch posts';
    console.error('Community fetch error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST - Create a new community post
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Create a global post (no group_id)
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        group_id: null, // Global post
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
        is_own_post: true,
        group_name: null,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
    console.error('Create post error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Delete a post (author only)
export async function DELETE(request: Request) {
  try {
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

    // Verify the user owns this post
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select('id, user_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
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

// Helper function to get comment counts
async function getCommentCounts(supabase: Awaited<ReturnType<typeof createClient>>, postIds: string[]) {
  const commentCounts: Record<string, number> = {};

  if (postIds.length > 0) {
    const { data: comments } = await supabase
      .from('community_comments')
      .select('post_id')
      .in('post_id', postIds);

    comments?.forEach((c: { post_id: string }) => {
      commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
    });
  }

  return commentCounts;
}

// Helper function to format posts
function formatPosts(
  posts: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    profiles?: { id: string; username?: string; full_name?: string; avatar_url?: string } | null;
    study_groups?: { id: string; name: string; is_public: boolean } | null;
  }>,
  commentCounts: Record<string, number>,
  currentUserId: string
) {
  return posts.map((p) => ({
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
    is_own_post: p.user_id === currentUserId,
    group_name: p.study_groups?.name || null,
    group_id: p.study_groups?.id || null,
  }));
}
