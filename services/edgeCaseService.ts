import { supabase } from '../lib/supabase';

export interface EdgeCase {
  id?: string;
  venture_id: string;
  category: 'error' | 'warning' | 'edge_case' | 'bug' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  context?: Record<string, any>;
  resolution?: string;
  status: 'open' | 'investigating' | 'resolved' | 'wont_fix';
  assigned_to?: string;
}

export async function logEdgeCase(edgeCase: EdgeCase) {
  const { data, error } = await supabase
    .from('edge_cases')
    .insert(edgeCase)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listEdgeCases(ventureId: string, filters?: {
  status?: string;
  severity?: string;
  category?: string;
}) {
  let query = supabase
    .from('edge_cases')
    .select('*')
    .eq('venture_id', ventureId);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.severity) {
    query = query.eq('severity', filters.severity);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateEdgeCase(edgeCaseId: string, updates: Partial<EdgeCase>) {
  const { data, error } = await supabase
    .from('edge_cases')
    .update(updates)
    .eq('id', edgeCaseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function resolveEdgeCase(edgeCaseId: string, resolution: string) {
  const { data, error } = await supabase
    .from('edge_cases')
    .update({
      status: 'resolved',
      resolution,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', edgeCaseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function createErrorHandler(ventureId: string) {
  return async (error: Error, context?: Record<string, any>) => {
    try {
      await logEdgeCase({
        venture_id: ventureId,
        category: 'error',
        severity: determineSeverity(error),
        title: error.message,
        description: error.stack,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
        status: 'open',
      });
    } catch (loggingError) {
      console.error('Failed to log edge case:', loggingError);
    }
  };
}

function determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
  const message = error.message.toLowerCase();

  if (
    message.includes('security') ||
    message.includes('unauthorized') ||
    message.includes('authentication')
  ) {
    return 'critical';
  }

  if (
    message.includes('database') ||
    message.includes('connection') ||
    message.includes('timeout')
  ) {
    return 'high';
  }

  if (message.includes('validation') || message.includes('invalid')) {
    return 'medium';
  }

  return 'low';
}

export async function getEdgeCaseStats(ventureId: string) {
  const { data: cases } = await supabase
    .from('edge_cases')
    .select('*')
    .eq('venture_id', ventureId);

  if (!cases) return null;

  const total = cases.length;
  const open = cases.filter((c) => c.status === 'open').length;
  const resolved = cases.filter((c) => c.status === 'resolved').length;

  const bySeverity = cases.reduce((acc, c) => {
    acc[c.severity] = (acc[c.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byCategory = cases.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total,
    open,
    resolved,
    bySeverity,
    byCategory,
  };
}

export const commonEdgeCases = [
  {
    title: 'Network Request Failed',
    category: 'error',
    severity: 'high',
    suggestions: [
      'Check internet connection',
      'Verify API endpoint is accessible',
      'Check for CORS issues',
      'Review rate limiting',
    ],
  },
  {
    title: 'Invalid Input Data',
    category: 'warning',
    severity: 'medium',
    suggestions: [
      'Add input validation',
      'Provide user-friendly error messages',
      'Add data sanitization',
      'Implement type checking',
    ],
  },
  {
    title: 'Authentication Expired',
    category: 'error',
    severity: 'critical',
    suggestions: [
      'Implement token refresh',
      'Redirect to login page',
      'Clear stored credentials',
      'Notify user of session timeout',
    ],
  },
  {
    title: 'Database Query Timeout',
    category: 'error',
    severity: 'high',
    suggestions: [
      'Optimize query performance',
      'Add database indexes',
      'Implement query caching',
      'Increase timeout limits',
    ],
  },
];
