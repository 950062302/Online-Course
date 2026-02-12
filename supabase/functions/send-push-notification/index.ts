import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0?target=es2020';
import webpush from 'https://esm.sh/web-push@3.6.7?target=es2020';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const vapidPublicKey = Deno.env.get('VITE_VAPID_PUBLIC_KEY'); // Public key from frontend .env
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY'); // Private key from Supabase secrets

    if (!supabaseUrl || !supabaseServiceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
      throw new Error('Supabase or VAPID environment variables are not set.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    // Set VAPID details for web-push
    webpush.setVapidDetails(
      'mailto:younineacademy@gmail.com', // Your contact email
      vapidPublicKey,
      vapidPrivateKey
    );

    const payload = await req.json();
    const newNotification = payload.record; // Get the new notification from the trigger payload

    if (!newNotification) {
      return new Response(JSON.stringify({ message: 'Bad Request: Missing notification record' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const notificationTitle = newNotification.message.substring(0, 50) + (newNotification.message.length > 50 ? '...' : '');
    const notificationBody = newNotification.message;
    const notificationUrl = '/dashboard/profile'; // Default URL to open on click

    let subscriptionsQuery = supabase
      .from('push_subscriptions')
      .select('*');

    if (newNotification.user_id) {
      // Send to a specific user
      subscriptionsQuery = subscriptionsQuery.eq('user_id', newNotification.user_id);
    } else {
      // Send to all users (broadcast)
      // Ensure we don't send to developers if they are not meant to receive broadcast notifications
      // This requires fetching user roles, which might be an extra step.
      // For simplicity, let's assume all subscribed non-developer users should receive broadcast.
      // If specific filtering is needed, it should be added here.
    }

    const { data: subscriptions, error: subscriptionsError } = await subscriptionsQuery;

    if (subscriptionsError) {
      throw subscriptionsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active push subscriptions found for this notification.');
      return new Response(JSON.stringify({ message: 'No subscriptions found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pushPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      const notificationPayload = JSON.stringify({
        title: notificationTitle,
        body: notificationBody,
        icon: '/favicon.ico', // Ensure this path is correct in your public folder
        data: {
          url: notificationUrl,
        },
      });

      try {
        await webpush.sendNotification(pushSubscription, notificationPayload);
        console.log('Push notification sent to:', sub.endpoint);
      } catch (pushError: any) {
        console.error('Error sending push notification to', sub.endpoint, ':', pushError.message);
        // If subscription is no longer valid, delete it from the database
        if (pushError.statusCode === 410 || pushError.statusCode === 404) { // GONE or NOT_FOUND
          console.warn('Expired subscription, deleting from DB:', sub.endpoint);
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    });

    await Promise.allSettled(pushPromises);

    return new Response(JSON.stringify({ message: 'Push notifications processed' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Edge Function error:", error.message);
    return new Response(JSON.stringify({ message: `Internal Server Error: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});