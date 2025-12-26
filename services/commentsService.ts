import { supabase } from '../lib/safeSupabase';

export interface Comment {
  id: string;
  venture_id: string;
  user_id: string;
  parent_id?: string;
  section_type: string;
  section_id?: string;
  content: string;
  mentions: string[];
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name?: string;
    email: string;
  };
  replies?: Comment[];
}

export interface CreateCommentParams {
  ventureId: string;
  sectionType: string;
  sectionId?: string;
  content: string;
  parentId?: string;
  mentions?: string[];
}

export const commentsService = {
  async getComments(ventureId: string, sectionType?: string, sectionId?: string): Promise<Comment[]> {
    let query = supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('venture_id', ventureId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (sectionType) {
      query = query.eq('section_type', sectionType);
    }

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    (data || []).forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    commentMap.forEach((comment) => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies!.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  },

  async createComment(params: CreateCommentParams): Promise<Comment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        venture_id: params.ventureId,
        user_id: user.id,
        parent_id: params.parentId || null,
        section_type: params.sectionType,
        section_id: params.sectionId || null,
        content: params.content,
        mentions: params.mentions || [],
      })
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .single();

    if (error) throw error;

    if (params.mentions && params.mentions.length > 0) {
      for (const mentionedUserId of params.mentions) {
        await supabase.rpc('create_notification', {
          p_user_id: mentionedUserId,
          p_venture_id: params.ventureId,
          p_type: 'mention',
          p_title: 'Mentioned in Comment',
          p_message: `You were mentioned in a comment`,
          p_data: { comment_id: data.id, section_type: params.sectionType },
        });
      }
    }

    return data;
  },

  async updateComment(commentId: string, content: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async deleteComment(commentId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('comments')
      .update({ is_deleted: true, content: '[deleted]' })
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  subscribeToComments(
    ventureId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`comments:${ventureId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `venture_id=eq.${ventureId}`,
        },
        callback
      )
      .subscribe();
  },
};
