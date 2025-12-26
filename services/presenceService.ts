import { supabase } from '../lib/safeSupabase';

export interface PresenceData {
  id: string;
  user_id: string;
  venture_id: string;
  session_id: string;
  cursor_position?: {
    x: number;
    y: number;
    section?: string;
  };
  last_seen: string;
  profiles?: {
    full_name?: string;
    email: string;
  };
}

export const presenceService = {
  sessionId: Math.random().toString(36).substring(2),

  async updatePresence(
    ventureId: string,
    cursorPosition?: { x: number; y: number; section?: string }
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('presence')
      .upsert({
        user_id: user.id,
        venture_id: ventureId,
        session_id: this.sessionId,
        cursor_position: cursorPosition || null,
        last_seen: new Date().toISOString(),
      }, {
        onConflict: 'user_id,venture_id,session_id',
      });

    if (error) console.error('Error updating presence:', error);
  },

  async getPresence(ventureId: string): Promise<PresenceData[]> {
    const { data, error } = await supabase
      .from('presence')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('venture_id', ventureId)
      .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error fetching presence:', error);
      return [];
    }

    return data || [];
  },

  async removePresence(ventureId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('presence')
      .delete()
      .eq('user_id', user.id)
      .eq('venture_id', ventureId)
      .eq('session_id', this.sessionId);
  },

  subscribeToPresence(ventureId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`presence:${ventureId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'presence',
          filter: `venture_id=eq.${ventureId}`,
        },
        callback
      )
      .subscribe();
  },

  startHeartbeat(ventureId: string, intervalMs: number = 30000): () => void {
    const interval = setInterval(() => {
      this.updatePresence(ventureId);
    }, intervalMs);

    return () => clearInterval(interval);
  },
};
