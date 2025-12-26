import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { supabase } from '../lib/supabase';

interface WorkflowAutomationProps {
  ventureId: string;
}

interface Automation {
  id: string;
  trigger_type: 'step_complete' | 'data_change' | 'scheduled';
  action_type: 'email' | 'notification' | 'export';
  config: any;
  is_active: boolean;
  created_at: string;
}

const WorkflowAutomation: React.FC<WorkflowAutomationProps> = ({ ventureId }) => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [triggerType, setTriggerType] = useState<'step_complete' | 'data_change' | 'scheduled'>('step_complete');
  const [actionType, setActionType] = useState<'email' | 'notification' | 'export'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAutomations();
  }, [ventureId]);

  const loadAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_automations')
        .select('*')
        .eq('venture_id', ventureId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAutomations(data || []);
    } catch (err) {
      console.error('Error loading automations:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('workflow_automations')
        .insert({
          venture_id: ventureId,
          user_id: userData.user.id,
          trigger_type: triggerType,
          action_type: actionType,
          config: {},
          is_active: true,
        });

      if (error) throw error;
      loadAutomations();
    } catch (err: any) {
      setError(err.message || 'Failed to create automation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('workflow_automations')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      loadAutomations();
    } catch (err: any) {
      setError(err.message || 'Failed to update automation');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workflow_automations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadAutomations();
    } catch (err: any) {
      setError(err.message || 'Failed to delete automation');
    }
  };

  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case 'step_complete': return 'When step completes';
      case 'data_change': return 'When data changes';
      case 'scheduled': return 'On schedule';
      default: return trigger;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'email': return 'Send email';
      case 'notification': return 'Show notification';
      case 'export': return 'Auto-export';
      default: return action;
    }
  };

  return (
    <Card className="w-full text-left">
      <CardHeader>
        <CardTitle className="text-xl">Workflow Automation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label htmlFor="trigger-type">When (Trigger)</Label>
            <select
              id="trigger-type"
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="step_complete">Step Completes</option>
              <option value="data_change">Data Changes</option>
              <option value="scheduled">Scheduled Time</option>
            </select>
          </div>

          <div>
            <Label htmlFor="action-type">Then (Action)</Label>
            <select
              id="action-type"
              value={actionType}
              onChange={(e) => setActionType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="email">Send Email Notification</option>
              <option value="notification">Show In-App Notification</option>
              <option value="export">Auto-Export to PDF</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Automation'}
          </Button>
        </form>

        {automations.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Active Automations ({automations.filter(a => a.is_active).length})
            </h4>
            <div className="space-y-2">
              {automations.map((automation) => (
                <div
                  key={automation.id}
                  className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {getTriggerLabel(automation.trigger_type)} → {getActionLabel(automation.action_type)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {automation.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(automation.id, automation.is_active)}
                    >
                      {automation.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(automation.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowAutomation;
