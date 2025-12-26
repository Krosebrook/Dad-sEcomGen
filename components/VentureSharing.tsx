import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { supabase } from '../lib/supabase';

interface VentureSharingProps {
  ventureId: string;
  ventureName: string;
}

interface Share {
  id: string;
  shared_with_email: string;
  permission_level: 'view' | 'edit';
  created_at: string;
  accepted_at: string | null;
}

const VentureSharing: React.FC<VentureSharingProps> = ({ ventureId, ventureName }) => {
  const [shares, setShares] = useState<Share[]>([]);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadShares();
  }, [ventureId]);

  const loadShares = async () => {
    try {
      const { data, error } = await supabase
        .from('venture_shares')
        .select('*')
        .eq('venture_id', ventureId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShares(data || []);
    } catch (err) {
      console.error('Error loading shares:', err);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('venture_shares')
        .insert({
          venture_id: ventureId,
          owner_id: userData.user.id,
          shared_with_email: email.toLowerCase(),
          permission_level: permission,
        });

      if (error) throw error;

      setSuccess(`Successfully shared "${ventureName}" with ${email}`);
      setEmail('');
      loadShares();
    } catch (err: any) {
      setError(err.message || 'Failed to share venture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('venture_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;
      loadShares();
    } catch (err: any) {
      setError(err.message || 'Failed to remove share');
    }
  };

  return (
    <Card className="w-full text-left">
      <CardHeader>
        <CardTitle className="text-xl">Share Venture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <Label htmlFor="share-email">Email Address</Label>
            <Input
              id="share-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="permission-level">Permission Level</Label>
            <select
              id="permission-level"
              value={permission}
              onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg text-sm">
              {success}
            </div>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Sharing...' : 'Share Venture'}
          </Button>
        </form>

        {shares.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Shared With ({shares.length})
            </h4>
            <div className="space-y-2">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {share.shared_with_email}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {share.permission_level === 'edit' ? 'Can edit' : 'View only'}
                      {share.accepted_at ? ' • Accepted' : ' • Pending'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveShare(share.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VentureSharing;
