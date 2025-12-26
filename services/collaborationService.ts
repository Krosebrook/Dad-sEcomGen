import { supabase } from '../lib/safeSupabase';
import { v4 as uuidv4 } from 'crypto';

export type CollaboratorRole = 'owner' | 'editor' | 'viewer';
export type CollaboratorStatus = 'pending' | 'accepted' | 'rejected';

export interface Collaborator {
  id: string;
  venture_id: string;
  user_id: string;
  role: CollaboratorRole;
  status: CollaboratorStatus;
  invited_by: string;
  invited_email?: string;
  invitation_token?: string;
  invited_at: string;
  accepted_at?: string;
  expires_at?: string;
  profiles?: {
    full_name?: string;
    email: string;
  };
}

export interface InviteCollaboratorParams {
  ventureId: string;
  email: string;
  role: CollaboratorRole;
}

export const collaborationService = {
  async getCollaborators(ventureId: string): Promise<Collaborator[]> {
    const { data, error } = await supabase
      .from('venture_collaborators')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('venture_id', ventureId)
      .order('invited_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async inviteCollaborator({ ventureId, email, role }: InviteCollaboratorParams): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: venture } = await supabase
      .from('ventures')
      .select('user_id')
      .eq('id', ventureId)
      .single();

    if (!venture || venture.user_id !== user.id) {
      throw new Error('Only venture owner can invite collaborators');
    }

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    const invitationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: invitation, error } = await supabase
      .from('venture_collaborators')
      .insert({
        venture_id: ventureId,
        user_id: existingUser?.id || null,
        role,
        status: 'pending',
        invited_by: user.id,
        invited_email: email,
        invitation_token: invitationToken,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    if (existingUser) {
      await supabase.rpc('create_notification', {
        p_user_id: existingUser.id,
        p_venture_id: ventureId,
        p_type: 'invitation',
        p_title: 'Venture Invitation',
        p_message: `You've been invited to collaborate on a venture`,
        p_data: { role, invitation_id: invitation.id },
      });
    }

    return invitation.id;
  },

  async acceptInvitation(invitationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('venture_collaborators')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitationId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async rejectInvitation(invitationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('venture_collaborators')
      .update({ status: 'rejected' })
      .eq('id', invitationId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async removeCollaborator(ventureId: string, collaboratorId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: venture } = await supabase
      .from('ventures')
      .select('user_id')
      .eq('id', ventureId)
      .single();

    if (!venture || venture.user_id !== user.id) {
      throw new Error('Only venture owner can remove collaborators');
    }

    const { error } = await supabase
      .from('venture_collaborators')
      .delete()
      .eq('id', collaboratorId)
      .eq('venture_id', ventureId);

    if (error) throw error;
  },

  async updateCollaboratorRole(
    ventureId: string,
    collaboratorId: string,
    role: CollaboratorRole
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: venture } = await supabase
      .from('ventures')
      .select('user_id')
      .eq('id', ventureId)
      .single();

    if (!venture || venture.user_id !== user.id) {
      throw new Error('Only venture owner can update roles');
    }

    const { error } = await supabase
      .from('venture_collaborators')
      .update({ role })
      .eq('id', collaboratorId)
      .eq('venture_id', ventureId);

    if (error) throw error;
  },

  async checkAccess(ventureId: string, requiredRole?: CollaboratorRole): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: venture } = await supabase
      .from('ventures')
      .select('user_id')
      .eq('id', ventureId)
      .maybeSingle();

    if (venture?.user_id === user.id) return true;

    const { data: collaborator } = await supabase
      .from('venture_collaborators')
      .select('role')
      .eq('venture_id', ventureId)
      .eq('user_id', user.id)
      .eq('status', 'accepted')
      .maybeSingle();

    if (!collaborator) return false;

    if (!requiredRole) return true;

    const roleHierarchy: Record<CollaboratorRole, number> = {
      owner: 3,
      editor: 2,
      viewer: 1,
    };

    return roleHierarchy[collaborator.role] >= roleHierarchy[requiredRole];
  },
};
