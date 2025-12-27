import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface WebhookTriggerRequest {
  webhookId: string;
  payload: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { webhookId, payload }: WebhookTriggerRequest = await req.json();

    if (!webhookId) {
      return new Response(
        JSON.stringify({ error: 'Missing webhookId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get webhook configuration
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhookId)
      .single();

    if (webhookError || !webhook) {
      return new Response(
        JSON.stringify({ error: 'Webhook not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (webhook.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Webhook is not active' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Merge payload with template
    const finalPayload = {
      ...webhook.payload_template,
      ...payload,
      triggeredAt: new Date().toISOString(),
    };

    // Trigger webhook
    const response = await fetch(webhook.url, {
      method: webhook.method,
      headers: {
        'Content-Type': 'application/json',
        ...webhook.headers,
      },
      body: JSON.stringify(finalPayload),
    });

    const success = response.ok;

    // Update webhook stats
    await supabase
      .from('webhooks')
      .update({
        last_triggered: new Date().toISOString(),
        success_count: success ? webhook.success_count + 1 : webhook.success_count,
        failure_count: success ? webhook.failure_count : webhook.failure_count + 1,
      })
      .eq('id', webhookId);

    return new Response(
      JSON.stringify({
        success,
        status: response.status,
        statusText: response.statusText,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook trigger error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});