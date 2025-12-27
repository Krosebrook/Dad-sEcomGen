import { supabase } from '../lib/supabase';

const WEBHOOK_TRIGGER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-trigger`;

export interface Webhook {
  id?: string;
  venture_id: string;
  name: string;
  event_type: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  payload_template?: Record<string, any>;
  status: 'active' | 'inactive';
}

export interface AutomationWorkflow {
  id?: string;
  venture_id: string;
  name: string;
  description?: string;
  trigger: {
    type: string;
    conditions?: any;
  };
  actions: Array<{
    type: string;
    config: any;
  }>;
  status: 'active' | 'inactive' | 'error';
}

export async function createWebhook(webhook: Webhook) {
  const { data, error } = await supabase
    .from('webhooks')
    .insert(webhook)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listWebhooks(ventureId: string) {
  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('venture_id', ventureId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateWebhook(webhookId: string, updates: Partial<Webhook>) {
  const { data, error } = await supabase
    .from('webhooks')
    .update(updates)
    .eq('id', webhookId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWebhook(webhookId: string) {
  const { error } = await supabase.from('webhooks').delete().eq('id', webhookId);

  if (error) throw error;
}

export async function triggerWebhook(webhookId: string, payload: any, token: string) {
  const response = await fetch(WEBHOOK_TRIGGER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ webhookId, payload }),
  });

  if (!response.ok) {
    throw new Error(`Webhook trigger failed: ${response.statusText}`);
  }

  return await response.json();
}

export async function createAutomationWorkflow(workflow: AutomationWorkflow) {
  const { data, error } = await supabase
    .from('automation_workflows')
    .insert(workflow)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listAutomationWorkflows(ventureId: string) {
  const { data, error } = await supabase
    .from('automation_workflows')
    .select('*')
    .eq('venture_id', ventureId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateAutomationWorkflow(
  workflowId: string,
  updates: Partial<AutomationWorkflow>
) {
  const { data, error } = await supabase
    .from('automation_workflows')
    .update(updates)
    .eq('id', workflowId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAutomationWorkflow(workflowId: string) {
  const { error } = await supabase
    .from('automation_workflows')
    .delete()
    .eq('id', workflowId);

  if (error) throw error;
}

export async function executeWorkflow(workflowId: string, context: any) {
  const { data: workflow } = await supabase
    .from('automation_workflows')
    .select('*')
    .eq('id', workflowId)
    .single();

  if (!workflow || workflow.status !== 'active') {
    throw new Error('Workflow not found or inactive');
  }

  const results = [];

  for (const action of workflow.actions) {
    try {
      const result = await executeAction(action, context);
      results.push({ action: action.type, success: true, result });
    } catch (error) {
      results.push({ action: action.type, success: false, error: error.message });
    }
  }

  await supabase
    .from('automation_workflows')
    .update({
      execution_count: workflow.execution_count + 1,
      last_executed: new Date().toISOString(),
    })
    .eq('id', workflowId);

  return results;
}

async function executeAction(action: any, context: any) {
  switch (action.type) {
    case 'send_email':
      return await sendEmail(action.config, context);
    case 'create_task':
      return await createTask(action.config, context);
    case 'update_database':
      return await updateDatabase(action.config, context);
    case 'call_webhook':
      return await callWebhook(action.config, context);
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

async function sendEmail(config: any, context: any) {
  return { sent: true, to: config.to };
}

async function createTask(config: any, context: any) {
  return { created: true, task: config.title };
}

async function updateDatabase(config: any, context: any) {
  const { table, data } = config;
  const { error } = await supabase.from(table).insert(data);
  if (error) throw error;
  return { updated: true };
}

async function callWebhook(config: any, context: any) {
  const response = await fetch(config.url, {
    method: config.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: JSON.stringify({ ...config.payload, context }),
  });

  return { status: response.status, ok: response.ok };
}

export const eventTypes = [
  'product.created',
  'product.updated',
  'product.deleted',
  'document.created',
  'document.signed',
  'inventory.low',
  'order.placed',
  'payment.received',
  'export.completed',
];

export const actionTypes = [
  { id: 'send_email', name: 'Send Email', fields: ['to', 'subject', 'body'] },
  { id: 'create_task', name: 'Create Task', fields: ['title', 'description'] },
  { id: 'update_database', name: 'Update Database', fields: ['table', 'data'] },
  { id: 'call_webhook', name: 'Call Webhook', fields: ['url', 'method', 'payload'] },
];
