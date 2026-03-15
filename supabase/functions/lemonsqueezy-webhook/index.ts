import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');
    const secret = Deno.env.get('LEMON_SQUEEZY_WEBHOOK_SECRET');

    // Verify signature if secret is provided in environment
    if (secret && signature) {
      const encoder = new TextEncoder();
      const hmacKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signatureBuffer = await crypto.subtle.sign("HMAC", hmacKey, encoder.encode(rawBody));
      const hexSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (hexSignature !== signature) {
        return new Response('Invalid signature', { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const obj = payload.data.attributes;

    // We only care about subscription events
    if (eventName && eventName.startsWith('subscription_')) {
      // The user_id must be passed during checkout in custom data
      const userId = payload.meta.custom_data?.user_id;

      if (!userId) {
        return new Response('No user_id in custom_data', { status: 400 });
      }

      const status = obj.status; // e.g. 'active', 'on_trial', 'cancelled', 'expired', 'past_due'
      // Use renews_at or ends_at for the period end
      const currentPeriodEnd = obj.renews_at || obj.ends_at;

      console.log(`Processing ${eventName} for user ${userId}. Status: ${status}`);

      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          status: status,
          lemon_squeezy_subscription_id: payload.data.id.toString(),
          lemon_squeezy_customer_id: obj.customer_id.toString(),
          lemon_squeezy_variant_id: obj.variant_id.toString(),
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Supabase update error:', error.message);
        return new Response(`Database error: ${error.message}`, { status: 500 });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    console.error('Webhook processing error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
