import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { InlineError } from '../ui/ErrorRetry';
import {
  collaborationService,
  type Collaborator,
  type CollaboratorRole,
} from '../../services/collaborationService';
import { validateField, emailSchema } from '../../lib/schemas';

interface TeamManagementProps {
  ventureId: string;
  isOwner: boolean;
}

export function TeamManagement({ ventureId, isOwner }: TeamManagementProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>('viewer');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCollaborators();
  }, [ventureId]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const data = await collaborationService.getCollaborators(ventureId);
      setCollaborators(data);
    } catch (err) {
      console.error('Error loading collaborators:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateField(emailSchema, inviteEmail);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid email');
      return;
    }

    try {
      setInviting(true);
      await collaborationService.inviteCollaborator({
        ventureId,
        email: validation.data!,
        role: inviteRole,
      });
      setInviteEmail('');
      setInviteRole('viewer');
      await loadCollaborators();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    if (!window.confirm('Remove this collaborator?')) return;

    try {
      await collaborationService.removeCollaborator(ventureId, collaboratorId);
      await loadCollaborators();
    } catch (err) {
      console.error('Error removing collaborator:', err);
    }
  };

  const handleRoleChange = async (collaboratorId: string, newRole: CollaboratorRole) => {
    try {
      await collaborationService.updateCollaboratorRole(ventureId, collaboratorId, newRole);
      await loadCollaborators();
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'editor':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        {isOwner && (
          <form onSubmit={handleInvite} className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="invite-role">Role</Label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as CollaboratorRole)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
            </div>
            {error && <InlineError error={error} />}
            <Button type="submit" disabled={inviting}>
              {inviting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </form>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No team members yet</div>
          ) : (
            collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {collaborator.profiles?.full_name || collaborator.invited_email || 'Unknown'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {collaborator.profiles?.email || collaborator.invited_email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(collaborator.status)}`}>
                    {collaborator.status}
                  </span>

                  {isOwner && collaborator.status === 'accepted' ? (
                    <select
                      value={collaborator.role}
                      onChange={(e) => handleRoleChange(collaborator.id, e.target.value as CollaboratorRole)}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="owner">Owner</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(collaborator.role)}`}>
                      {collaborator.role}
                    </span>
                  )}

                  {isOwner && (
                    <button
                      onClick={() => handleRemove(collaborator.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      aria-label="Remove collaborator"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
